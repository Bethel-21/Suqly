import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET;

    console.log('JWT STRATEGY SECRET LOADED:', !!secret);
    console.log('JWT STRATEGY SECRET LENGTH:', secret?.length);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret || 'dev_secret_change_me',
    });
  }

  async validate(payload: { sub: number; role: string }) {
    console.log('JWT VALIDATED:', payload);

    return {
      userId: payload.sub,
      role: payload.role,
    };
  }
}