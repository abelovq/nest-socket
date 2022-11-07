import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from 'src/typeorm/entities';
import { UsersService } from 'src/users/users.service';
import { Services } from 'src/utils/types';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

@Module({
  imports: [TypeOrmModule.forFeature(entities)],

  controllers: [ConversationController],
  providers: [
    { provide: Services.CONVERSATION, useClass: ConversationService },
    { provide: Services.USERS, useClass: UsersService },
    JwtService,
  ],
  exports: [{ provide: Services.CONVERSATION, useClass: ConversationService }],
})
export class ConversationModule {}
