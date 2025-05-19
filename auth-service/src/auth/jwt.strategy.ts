import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET_KEY');
    if (!secret) throw new Error('JWT_SECRET_KEY is not set!');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }
  validate(payload: { sub: string; loginId: string; roles: string[] }) {
    console.log(payload);

    return {
      userId: payload.sub,
      loginId: payload.loginId,
      roles: payload.roles,
    };
  }
}
