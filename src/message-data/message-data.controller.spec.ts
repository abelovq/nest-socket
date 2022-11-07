import { Test, TestingModule } from '@nestjs/testing';
import { MessageDataController } from './message-data.controller';

describe('MessageDataController', () => {
  let controller: MessageDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageDataController],
    }).compile();

    controller = module.get<MessageDataController>(MessageDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
