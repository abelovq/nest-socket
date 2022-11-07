import {
  Body,
  Controller,
  Inject,
  Post,
  UseGuards,
  Param,
  Get,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Services } from 'src/utils/types';
import { MessagesService } from './messages.service';
import { ChangeMessageStatusDto } from './types';

@Controller('messages')
export class MessagesController {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messagesService: MessagesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async changeMessageStatus(
    @Param('id') id: number,
    @Body()
    changeMessageStatusDto: ChangeMessageStatusDto,
  ) {
    const { status } = changeMessageStatusDto;
    return this.messagesService.changeMessageStatus({
      id,
      status,
    });
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('/notread/:id')
  // async getNotReadMessagesByConversationId(@Param('id') id: number) {
  //   return this.messagesService.getNotReadMessagesByConversationId(id);
  // }

  @UseGuards(JwtAuthGuard)
  @Get('/notread?')
  async getNotReadMessagesBySenderIdAndReceiverId(
    @Query('senderId', ParseIntPipe) senderId: number,
  ) {
    const result = await this.messagesService.getNotReadMessagesForSender({
      senderId,
    });
    console.log('result', result);
    return result;
  }
}
