import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationModule } from 'src/conversation/conversation.module';
import { MessagesModule } from 'src/messages/messages.module';
import { MessagesService } from 'src/messages/messages.service';
import { entities } from 'src/typeorm/entities';
import { UsersModule } from 'src/users/users.module';
import { Services } from 'src/utils/types';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [
    EventsGateway,
    JwtService,
    { provide: Services.MESSAGES, useClass: MessagesService },
  ],
  exports: [{ provide: Services.MESSAGES, useClass: MessagesService }],
  imports: [
    UsersModule,
    ConversationModule,
    MessagesModule,
    TypeOrmModule.forFeature(entities),
  ],
})
export class EventsModule {}
