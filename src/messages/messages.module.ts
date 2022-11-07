import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationService } from 'src/conversation/conversation.service';
import { MessageDataService } from 'src/message-data/message-data.service';
import { entities } from 'src/typeorm/entities';
import { UsersService } from 'src/users/users.service';
import { Services } from 'src/utils/types';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  controllers: [MessagesController],
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [
    { provide: Services.MESSAGES, useClass: MessagesService },
    { provide: Services.CONVERSATION, useClass: ConversationService },
    { provide: Services.USERS, useClass: UsersService },
    { provide: Services.MESSAGEDATA, useClass: MessageDataService },
  ],
  exports: [
    { provide: Services.MESSAGES, useClass: MessagesService },
    { provide: Services.MESSAGEDATA, useClass: MessageDataService },
  ],
})
export class MessagesModule {}
