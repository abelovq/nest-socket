import {
  Controller,
  Get,
  Inject,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Services } from 'src/utils/types';
import { ConversationService } from './conversation.service';

@Controller('messages/conversations')
export class ConversationController {
  constructor(
    @Inject(Services.CONVERSATION)
    private readonly conversationService: ConversationService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  // @Post()
  // async createConversation(
  //   @Body() createConversationDto: CreateConversationDto,
  // ) {
  //   return this.conversationService.create(createConversationDto);
  // }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllConversations() {
    return this.conversationService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/find?')
  async getConversation(
    @Query('senderId', ParseIntPipe) senderId: number,
    @Query('receiverId', ParseIntPipe) receiverId: number,
  ) {
    return this.conversationService.getOrCreateConversationMessages(
      senderId,
      receiverId,
    );
  }
}
