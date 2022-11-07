import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationService } from 'src/conversation/conversation.service';
import { User } from 'src/typeorm/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Services } from 'src/utils/types';
import { Repository } from 'typeorm';

import { AddToFriendsDetails, RemoveFromFriendsDetails } from './types';

@Injectable()
export class FriendsService {
  constructor(
    @Inject(Services.USERS) private readonly usersService: UsersService,
    @Inject(Services.CONVERSATION)
    private readonly conversationSerivice: ConversationService,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async getCurrUserFriends(currUserId: number) {
    const { friends } = await this.usersRepository.findOne({
      where: { id: currUserId },
    });

    if (friends !== null) {
      const result = await Promise.all(
        friends.map(
          async (f) =>
            await this.usersService.findUserByIdAndHisMessages({
              id: f,
              order: 'DESC',
            }),
        ),
      );
      return Promise.all(
        result.map(async (el) => {
          const conversationMessages =
            await this.conversationSerivice.getConversationMessagesByUser(
              currUserId,
              el.id,
            );

          return {
            ...el,
            lastMessage: conversationMessages.at(-1),
          };
        }),
      );
    }
    return [];
  }

  async addToFriends(
    currUserId: number,
    addToFriendsDetails: AddToFriendsDetails,
  ) {
    const { id } = addToFriendsDetails;
    const currUser = await this.usersService.findUserByIdAndHisMessages({
      id: currUserId,
    });
    const realIdOfFriend = await this.usersService.findUserByIdAndHisMessages({
      id,
    });
    if (currUser.friends === null) {
      currUser.friends = [realIdOfFriend.id];
    } else {
      currUser.friends = [...currUser.friends, realIdOfFriend.id];
    }
    await this.usersRepository.save(currUser);
  }

  async removeFromFriends(
    currUserId: number,
    removeFromFriendsDetails: RemoveFromFriendsDetails,
  ) {
    const { id } = removeFromFriendsDetails;
    const currUser = await this.usersService.findUserByIdAndHisMessages({
      id: currUserId,
    });
    currUser.friends = currUser.friends.filter((f) => f !== id);

    await this.usersRepository.save(currUser);
  }
}
