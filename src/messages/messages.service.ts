import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationService } from 'src/conversation/conversation.service';
import { MessageContent } from 'src/conversation/types';
import { MessageDataService } from 'src/message-data/message-data.service';
import { Conversation } from 'src/typeorm/entities/conversation.entity';
import { Message } from 'src/typeorm/entities/message.entity';
import { MessageData } from 'src/typeorm/entities/messageData.entity';
import { UsersService } from 'src/users/users.service';
import { Services } from 'src/utils/types';
import { DeepPartial, Not, Repository, UpdateResult } from 'typeorm';
import {
  ChangeMessageStatus,
  getNotReadMessagesForSenderDetails,
  updateMessageDetails,
} from './types';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(Services.CONVERSATION)
    private readonly conversationService: ConversationService,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @Inject(Services.USERS)
    private readonly usersService: UsersService,
    @Inject(Services.MESSAGEDATA)
    private readonly messageDataService: MessageDataService,
  ) {}

  async createMessage(
    messageContent: MessageContent,
    conversationEntity: Conversation,
  ) {
    const { senderId, ...rest } = messageContent;
    const message = {};

    let messageData: MessageData[] = [];
    for (const key in rest.data) {
      if (Array.isArray(rest.data[key])) {
        messageData = await Promise.all<MessageData[]>(
          rest.data[key].map(async ({ publicUrl: url, type }) => {
            return await this.messageDataService.create({ url, type });
          }),
        );
        message['data'] = messageData;
      } else {
        message[key] = rest.data[key];
      }
    }

    const user = await this.usersService.findUserByIdAndHisMessages({
      id: senderId,
    });

    const newMessage = await this.messagesRepository.create({
      ...message,
      user,
      conversation: conversationEntity,
    });

    await this.messagesRepository.save(newMessage);
    return newMessage;
  }

  async changeMessageStatus(data: ChangeMessageStatus): Promise<UpdateResult> {
    const { id, status } = data;
    console.log('data', data);
    return this.messagesRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: status })
      .where('id = :id', { id })
      .execute();
  }

  async changeMessagesStatusToTrue(id: number): Promise<Message[]> {
    const notReadMessages = await this.getNotReadMessagesByConversationId(id);
    const readMessages = notReadMessages.map((m) => ({ ...m, isRead: true }));
    this.messagesRepository.save(readMessages);
    return readMessages;
  }

  async getNotReadMessagesByConversationId(id: number) {
    return this.messagesRepository.find({
      where: {
        isRead: false,
        conversation: {
          id,
        },
      },
      relations: ['user'],
    });
  }

  async getNotReadMessagesForSender(
    data: getNotReadMessagesForSenderDetails,
  ): Promise<Record<number, Message[]>> {
    const { senderId } = data;
    const users = await this.usersService.findAllExceptSelf(senderId);

    try {
      const conversations = await Promise.all(
        users.map(
          async (user) =>
            (
              await this.conversationService.getConversation(senderId, user.id)
            )?.id,
        ),
      );

      const messages = await Promise.all(
        conversations.map((c) => {
          if (c !== undefined) {
            return this.messagesRepository.find({
              where: {
                isRead: false,
                conversation: {
                  id: c,
                },
                user: {
                  id: Not(senderId),
                },
              },
              relations: ['user'],
            });
          }
        }),
      );

      return users.reduce((acc, curr, i) => {
        acc[curr.id] = messages[i];
        return acc;
      }, {});
    } catch (err) {
      console.log('err', err);
    }
  }

  async getMessage(id: number) {
    return this.messagesRepository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });
  }

  async updateMessage(data: updateMessageDetails) {
    try {
      const updatedMessageEntity = await this.messagesRepository.preload({
        ...data.body,
      } as DeepPartial<MessageData>);

      // Here we update (create if not exists) `updatedUserEntity` to the database
      return this.messagesRepository.save(updatedMessageEntity);
    } catch (err) {
      console.log('err', err);
      // TODO handle err
    }
  }
}
