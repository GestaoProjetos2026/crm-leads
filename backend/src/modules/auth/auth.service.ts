import { Injectable, UnauthorizedException, ForbiddenException, GoneException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    throw new GoneException('Login is now handled by Core Engine');
  }

  async login(email: string, password: string): Promise<{ access_token: string }> {
    throw new GoneException('Login is now handled by Core Engine');
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

  /**
   * Cria um novo usuário, validando duplicidade de email e hash da senha.
   */
  async register(data: {
    email: string;
    password: string;
    tenantId: number;
    profile?: string;
  }): Promise<User> {
    const { email, password, tenantId, profile } = data;
    // Verifica se já existe usuário com o mesmo email
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new Error('Usuário já existe com este email');
    }
    const passwordHash = await this.hashPassword(password);
    const user = this.userRepository.create({
      email,
      passwordHash,
      tenantId,
      profile: profile || 'sales_rep',
    });
    return this.userRepository.save(user);
  }
}
