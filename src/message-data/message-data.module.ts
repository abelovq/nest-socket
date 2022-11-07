import { Module } from '@nestjs/common';

import { MessageDataController } from './message-data.controller';

@Module({
  controllers: [MessageDataController],
})
export class MessageDataModule {}
