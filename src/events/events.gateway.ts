import { Inject, Req, Request, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createWriteStream } from 'fs';
import * as path from 'path';
import * as filetype from 'file-type';
import { v4 as uuidv4 } from 'uuid';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { jwtConstants } from 'src/auth/constants';
import { ConversationService } from 'src/conversation/conversation.service';
import { MessageContent } from 'src/conversation/types';
import { MessagesService } from 'src/messages/messages.service';
import { User } from 'src/typeorm/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Events, Services } from 'src/utils/types';
import { SocketGuard } from './socket.guard';
import { getFileType, cloudinaryUpload } from 'src/utils/functions';
import { LastMessage, updateMessageDetails } from 'src/messages/types';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    'Access-Control-Allow-Headers': 'Authorization',
    credentials: true,
  },
  maxHttpBufferSize: 1e8,
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(Services.USERS) private readonly usersService: UsersService,
    @Inject(Services.CONVERSATION)
    private readonly conversationService: ConversationService,
    @Inject(Services.MESSAGES)
    private readonly messagesService: MessagesService,
    private jwtService: JwtService,
  ) {}

  private async decodeToken(token: string) {
    try {
      return this.jwtService.verify(token, jwtConstants) as any;
    } catch {}
  }

  private async updateAndReturn<T>(
    socket: Socket,
    obj: Partial<Record<keyof T, string | number>>,
  ) {
    try {
      const token = socket.handshake.headers.authorization.split(' ')[1];
      const decoded = await this.decodeToken(token);

      const user = await this.usersService.findUserByEmail(decoded.email);

      const keys = Object.keys(obj);

      for (const key of keys) {
        user[key] = obj[key];
      }

      await this.usersService.save({
        entity: User,
        updatedFields: user,
        id: user.id,
      });

      const userWithLastMessage: User & { lastMessage?: LastMessage } =
        await this.usersService.findUserByIdAndHisMessages({
          id: user.id,
          order: 'DESC',
        });

      return userWithLastMessage;
    } catch (err) {
      console.log('updateAndReturn err', err);
    }
  }

  @SubscribeMessage(Events.LOGOUT)
  async logout(
    @Req() req: Request,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    console.log('LOGOUT');
    this.handleLogout(socket);
  }

  async handleConnection(socket: Socket) {
    try {
      console.log('handleConnection', socket.id);
      await this.updateAndReturn<User>(socket, { socketId: socket.id });

      const token = socket.handshake.headers.authorization.split(' ')[1];

      const decoded = await this.decodeToken(token);

      socket.join(`room-${decoded.email}`);

      socket.on('disconnect', (reason) => {
        console.log(`DISCONNECT ${reason}`);
      });
    } catch (err) {
      socket.disconnect();
    }
  }

  async handleLogout(socket: Socket) {
    try {
      const user = await this.usersService.findUserBySocketId(socket.id);

      user.status = 'offline';

      await this.usersService.save({
        entity: User,
        updatedFields: user,
        id: user.id,
      });

      const userWhoLogout: User & { lastMessage?: LastMessage } =
        await this.usersService.findUserByIdAndHisMessages({
          id: user.id,
          order: 'DESC',
        });

      socket.broadcast.emit(Events.LOGOUT, userWhoLogout);
      socket.disconnect(true);
    } catch (err) {
      socket.disconnect(true);
      console.log('LOGOUT err', err);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(Events.LOGIN_NEW_PARTICIPANT)
  async loginNewUser(
    @Req() req,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    try {
      const updatedUser = await this.updateAndReturn(socket, {
        status: 'online',
      });

      socket.broadcast.emit(Events.JOIN_NEW_PARTICIPANT, updatedUser);
    } catch (err) {
      console.log('err', err);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(Events.RECONNECT)
  async reconnect(
    @Req() req: Request,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    const onlineUsers = await this.usersService.findUsersByStatus({
      status: 'online',
    });

    const token = socket.handshake.headers.authorization.split(' ')[1];
    const decoded = await this.decodeToken(token);

    const newOnlineUsers = onlineUsers.filter((u) => u.email !== decoded.email);

    socket.emit(Events.RECONNECT, newOnlineUsers);
  }

  handleDisconnect(socket: Socket) {
    console.log(`Disconnected 123: ${socket.id}`);
    this.handleLogout(socket);
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(Events.SEND_PRIVATE_MESSAGE)
  async receiveMessage(
    @MessageBody() content: MessageContent,
    @ConnectedSocket() socket: Socket,
  ): Promise<any> {
    function process(item) {
      return new Promise(async (res, rej) => {
        try {
          const fileType = await filetype.fromBuffer(Buffer.from(item));
          const uuid = uuidv4();

          const writeStream = createWriteStream(
            path.join(__dirname, `/${uuid}.${fileType.ext}`),
          );
          writeStream.end(item);
          writeStream.on('error', (err) => rej(err));
          writeStream.on('finish', () => {
            console.log('finish');
            res(path.join(__dirname, `/${uuid}.${fileType.ext}`));
          });
        } catch (err) {
          console.log('MESSAGE ERROR', err);
        }
      });
    }

    if (content.data.files.length) {
      try {
        const result = await Promise.all(content.data.files.map(process));
        const urls = await Promise.all(
          result.map(async (path) => {
            const type = getFileType(path.slice(-3));
            const publicUrl = await cloudinaryUpload(path, type);
            return { publicUrl, type };
          }),
        );

        content.data.files = urls;
        return this.handleReceiveMessage(socket, content);
      } catch (err) {
        console.log(err);
      }
    } else {
      return this.handleReceiveMessage(socket, content);
    }
  }

  async handleReceiveMessage(socket: Socket, content: MessageContent) {
    try {
      const {
        senderId,
        receiverId,
        data: { text, files },
      } = content;
      const conversations = await this.conversationService.getAll();

      for (const {
        users: [user1, user2],
        id: conversationId,
      } of conversations) {
        if (
          (user1.id === senderId && user2.id === receiverId) ||
          (user1.id === receiverId && user2.id === senderId)
        ) {
          const existedConversation =
            await this.conversationService.getConversation(
              senderId,
              receiverId,
            );
          if (existedConversation) {
            const user = await this.usersService.findUserByIdAndHisMessages({
              id: receiverId,
            });
            const messageContent = {
              senderId,
              receiverId,
              data: {
                text,
                files,
              },
            };

            const newMessage = await this.messagesService.createMessage(
              messageContent,
              existedConversation,
            );
            const {
              conversation: { id },
              ...rest
            } = newMessage;

            delete rest.user.messages;

            socket
              .to(`room-${user.email}`)
              .emit(Events.RECEIVE_PRIVATE_MESSAGE, {
                ...rest,
                conversation: { id },
              });
            return { ...rest, conversation: { id } };
          }
        }
      }
    } catch (err) {
      console.log('handleReceiveMessage err', err);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(Events.TYPING)
  async typing(
    @Req() req: Request,
    @MessageBody() content: { who: number; toWhom: number },
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    const { who, toWhom } = content;
    const { name, id } = await this.usersService.findUserByIdAndHisMessages({
      id: who,
    });
    const { email } = await this.usersService.findUserByIdAndHisMessages({
      id: toWhom,
    });

    socket.to(`room-${email}`).emit(Events.WHO_TYPING, { name, id });
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(Events.STOP_TYPING)
  async stopTyping(
    @Req() req: Request,
    @MessageBody() content: { who: number; toWhom: number },
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    const { who, toWhom } = content;
    const { name, id } = await this.usersService.findUserByIdAndHisMessages({
      id: who,
    });
    const { email } = await this.usersService.findUserByIdAndHisMessages({
      id: toWhom,
    });

    socket.to(`room-${email}`).emit(Events.STOP_TYPING, { name, id });
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(Events.READ_MESSAGE)
  async readMessage(
    @Req() req: Request,
    @MessageBody()
    content:
      | { senderId: number; receiverId: number }
      | { senderId: number; messageId: number },
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    console.log('READ_MESSAGE', content);
    if ('messageId' in content) {
      const { messageId, senderId } = content;

      const { email } = await this.usersService.findUserByIdAndHisMessages({
        id: senderId,
      });
      const message = await this.messagesService.getMessage(messageId);

      socket.broadcast
        .to(`room-${email}`)
        .emit(Events.READ_MESSAGE_DONE, [message]);
    } else {
      const { senderId, receiverId } = content;
      const { email } = await this.usersService.findUserByIdAndHisMessages({
        id: senderId,
      });

      const conversation = await this.conversationService.getConversation(
        senderId,
        receiverId,
      );

      const messages = await this.messagesService.changeMessagesStatusToTrue(
        conversation.id,
      );

      socket.broadcast
        .to(`room-${email}`)
        .emit(Events.READ_MESSAGE_DONE, messages);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(Events.EDIT_MESSAGE)
  async editMessage(
    @Req() req: Request,
    @MessageBody() content: updateMessageDetails,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const { receiverId } = content;

      const updatedMessage = await this.messagesService.updateMessage(content);

      const { email } = await this.usersService.findUserByIdAndHisMessages({
        id: receiverId,
      });

      socket.to(`room-${email}`).emit(Events.EDIT_MESSAGE_DONE, updatedMessage);
      return updatedMessage;
    } catch (err) {
      console.log(err);
    }
  }
}
