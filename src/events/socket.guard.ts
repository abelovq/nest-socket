import {
  CanActivate,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { jwtConstants } from 'src/auth/constants';
import { UsersService } from 'src/users/users.service';
import { Services } from 'src/utils/types';

@Injectable()
export class SocketGuard implements CanActivate {
  constructor(
    @Inject(Services.USERS) private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    const bearerToken =
      context.args[0].handshake.headers.authorization.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(bearerToken, jwtConstants) as any;

      return new Promise((resolve, reject) => {
        return this.usersService.findUserByEmail(decoded.email).then((user) => {
          if (user) {
            resolve(user);
          } else {
            reject(false);
          }
        });
      });
    } catch (err) {
      console.log('err', err.message);
      throw new WsException(err.message);
    }
  }
}
