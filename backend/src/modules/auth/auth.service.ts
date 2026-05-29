import { Injectable, UnauthorizedException, ForbiddenException, GoneException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

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

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
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

  /**
   * Realiza o login de um usuário cadastrada na aplicação
   */
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

  /**
   * Realiza o login de um usuário usando erp_core
   */
  async loginCore(email: string, password: string): Promise<{ access_token: string }> {
    let profile: {
      accessToken: string,
      refreshToken: string,
      tokenType: string, // "Bearer"
      expiresIn: number  // 900
    };
    try {
      const response = await fetch('https://api.core-engine.40.82.176.176.nip.io/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
          throw new UnauthorizedException({
            message: 'Invalid credentials',
          });
      }

      const body = await response.json() as {
        data: {
          accessToken: string,
          refreshToken: string,
          tokenType: string, // "Bearer"
          expiresIn: number  // 900
        }
      };
      profile = body.data;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new GoneException({
        message: 'Could not reach Core Engine to validate credentials',
      });
    }

    this.register({
      email,
      password,
      tenantId: 1,
      profile: 'sales_rep',
    }).catch(() => {
      // Se der erro é porque o usuário já existe, o que é esperado nesse fluxo
    });

    return { access_token: profile.accessToken };
  }

  async loginCoreEngine(email: string, password: string): Promise<{ access_token: string }> {
    const response = await fetch('https://api.core-engine.40.82.176.176.nip.io/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        "email": email,
        "password": password
      })
    });

    if (!response.ok) {
      throw new UnauthorizedException({
        message: 'Credential Invalid',
        errorCode: 'AUTH_TOKEN_INVALID',
      });
    }

    const body = await response.json() as {
      data: {
        accessToken: string,
        refreshToken: string,
        tokenType: string, // "Bearer"
        expiresIn: number  // 900
      }
    };
    const data = body.data;

    const existingInLocalBase = await this.userRepository.findOne({ where: { email } });
    if (!existingInLocalBase) {
      const passwordHash = await this.hashPassword(password);
      // Adiciona no banco local para futuros logins
      this.userRepository.create({
        email,
        passwordHash,
        tenantId: 1,
        profile: 'sales_rep',
      });
    }

    return { access_token: data.accessToken }
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
      throw new BadRequestException('Usuário já existe com este email');
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
