import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DataSource } from 'typeorm';
import { UsersController } from './users/users.controller';
import { EventsModule } from './events/events.module';
import { ConversationModule } from './conversation/conversation.module';
import { ConversationController } from './conversation/conversation.controller';
import { MessagesModule } from './messages/messages.module';
import { MessagesController } from './messages/messages.controller';
import { FrindsModule } from './friends/friends.module';
import { MessageDataModule } from './message-data/message-data.module';
import { MessageDataController } from './message-data/message-data.controller';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'pass111!',
      database: 'chat',
      entities: [],
      synchronize: true,
      autoLoadEntities: true,
    }),
    EventsModule,
    ConversationModule,
    MessagesModule,
    FrindsModule,
    MessageDataModule,
  ],
  controllers: [
    AppController,
    AuthController,
    UsersController,
    ConversationController,
    MessagesController,
    MessageDataController,
  ],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
