import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Services } from 'src/utils/types';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { entities } from 'src/typeorm/entities';

@Module({
  controllers: [UsersController],
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [{ provide: Services.USERS, useClass: UsersService }],
  exports: [{ provide: Services.USERS, useClass: UsersService }],
})
export class UsersModule {}
