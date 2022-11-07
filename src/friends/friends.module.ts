import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationService } from 'src/conversation/conversation.service';
import { entities } from 'src/typeorm/entities';
import { UsersService } from 'src/users/users.service';
import { Services } from 'src/utils/types';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  controllers: [FriendsController],
  imports: [TypeOrmModule.forFeature(entities)],

  providers: [
    { provide: Services.USERS, useClass: UsersService },
    { provide: Services.FRIENDS, useClass: FriendsService },
    { provide: Services.CONVERSATION, useClass: ConversationService },
  ],
})
export class FrindsModule {}
