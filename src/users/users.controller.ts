import { Body, Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Services } from 'src/utils/types';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(Services.USERS) private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/online')
  findOnlineUsers() {
    return this.usersService.findOnlineUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllExceptSelf(@Req() req) {
    return this.usersService.findAllExceptSelf(req.user.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/new')
  getNewUsersWithNotReadMessages(@Req() req, @Body() id: number) {
    return this.usersService.findNewUsersWithNotReadMessages({ id });
  }
}
