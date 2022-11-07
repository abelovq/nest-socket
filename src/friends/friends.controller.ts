import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Services } from 'src/utils/types';
import { FriendsService } from './friends.service';
import { AddToFriendsDto, RemoveFromFriendsDto } from './types';

@Controller('friends')
export class FriendsController {
  constructor(
    @Inject(Services.FRIENDS) private readonly friendsService: FriendsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllFriendsOfCurrUser(@Req() req) {
    const { id } = req.user;

    return this.friendsService.getCurrUserFriends(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/add')
  addToFriends(@Req() req, @Body() addToFriendsDto: AddToFriendsDto) {
    return this.friendsService.addToFriends(req.user.id, addToFriendsDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/remove')
  removeFromFriends(
    @Req() req,
    @Body() removeFromFriendsDto: RemoveFromFriendsDto,
  ) {
    return this.friendsService.removeFromFriends(
      req.user.id,
      removeFromFriendsDto,
    );
  }
}
