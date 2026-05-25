import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'default-secret'),
    });
  }

  async validate(payload: any) {
    if (payload.type !== 'user_access' && payload.type !== 'integration_access') {
      throw new Error('Invalid token type');
    }

    // Look up the user in the local database to find their tenant_id
    let tenantId = null;
    if (payload.email) {
      const user = await this.userRepository.findOne({ where: { email: payload.email } });
      if (user) {
        tenantId = user.tenantId;
      }
    }

    return {
      userId: payload.sub,
      tenant_id: tenantId,
      profile: (payload.roles && payload.roles.length > 0) ? payload.roles[0] : 'user',
      scopes: payload.perms || payload.scopes || [],
      email: payload.email,
    };
  }
}