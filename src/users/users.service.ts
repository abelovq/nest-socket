import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { findUserByIdDetails, IUsersService } from './types';
import { User } from '../typeorm/entities/user.entity';
import { Not, Repository, UpdateResult } from 'typeorm';
import { SaveEntity } from 'src/utils/types';

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async findUserByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOneBy({ email });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findAllExceptSelf(id: number): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        id: Not(id),
      },
    });
  }

  async save({ entity, updatedFields, id }: SaveEntity): Promise<UpdateResult> {
    return this.usersRepository
      .createQueryBuilder()
      .update(entity)
      .set(updatedFields)
      .where('id = :id', { id })
      .execute();
  }

  async findUsersByStatus({ status }): Promise<User[]> {
    return this.usersRepository.findBy({ status });
  }

  async findUserByIdAndHisMessages({
    id,
    order = 'ASC',
  }: findUserByIdDetails): Promise<User> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['messages'],
      order: {
        messages: {
          createdAt: order,
        },
      },
    });
  }

  // TODO if someone send message and not in friends list
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async findNewUsersWithNotReadMessages({ id }: { id: number }) {}

  async findOnlineUsers() {
    return this.usersRepository.find({
      where: {
        status: 'online',
      },
    });
  }

  async findUserBySocketId(socketId: string) {
    return this.usersRepository.findOne({
      where: {
        socketId,
      },
    });
  }
}
