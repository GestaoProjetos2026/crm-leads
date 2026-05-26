import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { ConfigService } from '@nestjs/config';

/**
 * JwtStrategy — Remote Validation via Core Engine
 *
 * Em vez de validar a assinatura JWT localmente (o que exigiria compartilhar
 * o JWT_SECRET do Core Engine), essa estratégia encaminha o token para o
 * endpoint GET /v1/auth/me do Core Engine e usa a resposta para popular
 * o contexto de usuário. Isso mantém o secret isolado no Core Engine.
 *
 * Variável necessária no .env:
 *   CORE_ENGINE_URL=http://api.core-engine.40.82.176.176.nip.io
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly coreEngineUrl: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.coreEngineUrl = this.configService.get<string>(
      'CORE_ENGINE_URL',
      'http://api.core-engine.40.82.176.176.nip.io',
    );
  }

  async validate(req: Request): Promise<any> {
    const authHeader = (req.headers as any)['authorization'] as string | undefined;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        message: 'Missing Bearer token',
        errorCode: 'AUTH_TOKEN_INVALID',
      });
    }

    const token = authHeader.slice(7);

    let profile: any;
    try {
      const response = await fetch(`${this.coreEngineUrl}/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new UnauthorizedException({
          message: 'Token rejected by Core Engine',
          errorCode: 'AUTH_TOKEN_INVALID',
        });
      }

      const body = await response.json() as any;
      profile = body.data;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException({
        message: 'Could not reach Core Engine to validate token',
        errorCode: 'AUTH_TOKEN_INVALID',
      });
    }

    // TODO: Reativar após criar as tabelas locais e popular o banco de dados.
    // const user = await this.userRepository.findOne({ where: { email: profile.email } });
    // const tenantId = user?.tenantId ?? null;
    const tenantId = 1; // TEMP: tenant fixo para testes enquanto o banco local não está populado

    return {
      userId: profile.userId ?? profile.id,
      tenant_id: tenantId,
      profile: (profile.roles && profile.roles.length > 0) ? profile.roles[0] : 'user',
      scopes: profile.permissions ?? profile.perms ?? [],
      email: profile.email,
    };
  }
}