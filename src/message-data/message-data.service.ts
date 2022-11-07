import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageData } from 'src/typeorm/entities/messageData.entity';
import { Repository } from 'typeorm';
import { MessageDataDetails } from './types';

@Injectable()
export class MessageDataService {
  constructor(
    @InjectRepository(MessageData)
    private readonly messageDataRepository: Repository<MessageData>,
  ) {}

  async create(data: MessageDataDetails) {
    const { url, type } = data;
    const newMessageData = new MessageData();
    newMessageData.type = type;
    newMessageData.url = url;

    return this.messageDataRepository.save(newMessageData);
  }
}
