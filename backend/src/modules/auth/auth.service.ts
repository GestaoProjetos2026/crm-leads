import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { User } from './entities/user.entity';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['tenant'],
    });

    if (!user?.passwordHash) {
      return null;
    }

    const [salt, storedHash] = user.passwordHash.split(':');
    if (!salt || !storedHash) {
      return null;
    }

    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    const hashedPassword = Buffer.from(storedHash, 'hex');

    if (timingSafeEqual(hashedPassword, derivedKey)) {
      return user;
    }

    return null;
  }

  async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.tenant?.isBlocked) {
      throw new ForbiddenException('Tenant account blocked');
    }

    const payload: JwtPayload = {
      sub: user.id,
      tenant_id: user.tenantId,
      profile: user.profile,
      scopes: this.getScopesForProfile(user.profile),
    };

    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }

  private getScopesForProfile(profile: string): string[] {
    // Define scopes based on profile
    switch (profile) {
      case 'director':
        return ['analytics:read', 'opportunities:write', 'users:write'];
      case 'marketing_manager':
        return ['analytics:read', 'leads:write', 'opportunities:read'];
      case 'sales_rep':
      default:
        return ['leads:read', 'opportunities:read'];
    }
  }

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }
}
