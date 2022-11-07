import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from 'src/typeorm/entities/conversation.entity';
import { UsersService } from 'src/users/users.service';
import { Services } from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @Inject(Services.USERS) private readonly usersService: UsersService,
  ) {}

  // async create(conversationDetails: ConversationDetails) {
  //   console.log('create');
  //   const conversations = await this.getAll();

  //   const { senderId, receiverId } = conversationDetails;
  //   console.log('conversations', conversations);
  //   for (const {
  //     users: [user1, user2],
  //     id: conversationId,
  //   } of conversations) {
  //     if (
  //       (user1.id === senderId && user2.id === receiverId) ||
  //       (user1.id === receiverId && user2.id === senderId)
  //     ) {
  //       const existedConversation = await this.conversationRepository.find({
  //         where: { id: conversationId },
  //         relations: ['messages', 'messages.user'],
  //       });
  //       console.log('existedConversation[0].messages', existedConversation);
  //       return;
  //     }
  //   }

  //   const user1 = await this.usersService.findUserById(senderId);
  //   const user2 = await this.usersService.findUserById(receiverId);

  //   console.log('conversations', conversations);
  //   const conversation = new Conversation();
  //   conversation.users = [user1, user2];
  //   conversation.messages = [];
  //   await this.conversationRepository.save(conversation);
  // }

  async getAll() {
    return this.conversationRepository.find({
      relations: {
        users: true,
      },
    });
  }

  async getConversationById(id: number) {
    return this.conversationRepository.find({
      where: { id },
      relations: ['messages'],
    });
  }

  async getConversation(senderId: number, receiverId: number) {
    const conversations = await this.getAll();

    for (const {
      users: [user1, user2],
      id: conversationId,
    } of conversations) {
      if (
        (user1.id === senderId && user2.id === receiverId) ||
        (user1.id === receiverId && user2.id === senderId)
      ) {
        const existedConversation = await this.conversationRepository.find({
          where: { id: conversationId },
          relations: ['messages', 'messages.user', 'messages.data'],

          // take: 10,
        });

        return existedConversation[0];
      }
    }
    return null;
  }

  async getOrCreateConversationMessages(senderId: number, receiverId: number) {
    const conversation = await this.getConversation(senderId, receiverId);
    // const pageSize = 10;
    // const totalPages = Math.ceil(conversation.messages.length / pageSize);

    // variant of progressive loading content - some lags if a lot of elements in the DOM
    // if (conversation) {
    //   if (page > 1) {
    //     const slice = conversation.messages.slice(
    //       -page * pageSize,
    //       (-page + 1) * pageSize,
    //     );
    //     conversation.previousGrabbedIds = slice.map((el) => el.id);
    //     this.conversationRepository.save(conversation);
    //     return conversation.messages.slice(
    //       -page * pageSize,
    //       (-page + 1) * pageSize,
    //     );
    //   }
    //   const slice = conversation.messages.slice(-page * pageSize);
    //   if (conversation.previousGrabbedIds === null) {
    //     conversation.previousGrabbedIds = slice.map((el) => el.id);
    //     this.conversationRepository.save(conversation);
    //   }

    //   return {
    //     messages: slice,
    //     totalPages,
    //   };
    // }

    if (conversation) {
      return conversation.messages.map((m) => ({
        ...m,
        conversation: { id: conversation.id },
      }));
    }

    const user1 = await this.usersService.findUserByIdAndHisMessages({
      id: senderId,
    });
    const user2 = await this.usersService.findUserByIdAndHisMessages({
      id: receiverId,
    });

    const newConversation = new Conversation();

    const savedConversation = await this.conversationRepository.save(
      newConversation,
    );

    savedConversation.users = [user1, user2];
    savedConversation.messages = [];

    await this.conversationRepository.save(savedConversation);
    return savedConversation.messages;
  }

  async getConversationMessagesByUser(senderId: number, receiverId: number) {
    const allMessages = await this.getOrCreateConversationMessages(
      senderId,
      receiverId,
    );
    return allMessages.filter((m) => m.user.id === receiverId);
  }
}
