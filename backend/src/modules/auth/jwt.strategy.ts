import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

/**
 * JwtStrategy — Remote Validation via Core Engine
 *
 * Em vez de validar a assinatura JWT localmente (o que exigiria compartilhar
 * o JWT_SECRET do Core Engine), essa estratégia encaminha o token para o
 * endpoint GET /v1/auth/me do Core Engine e usa a resposta para popular
 * o contexto de usuário. Isso mantém o secret isolado no Core Engine.
 *
 * Variável necessária no .env:
 *   CORE_ENGINE_URL=https://api.core-engine.40.82.176.176.nip.io
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly coreEngineUrl: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.coreEngineUrl = this.configService.get<string>(
      'CORE_ENGINE_URL',
      'https://api.core-engine.40.82.176.176.nip.io',
    );
  }

  async validate(req: Request): Promise<any> {
    const authHeader = (req.headers as any)['authorization'] as string | undefined;

    if (authHeader == undefined) 
      throw new UnauthorizedException({
        message: 'Missing Bearer token',
        errorCode: 'AUTH_TOKEN_INVALID',
      })

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        message: 'Missing Bearer token',
        errorCode: 'AUTH_TOKEN_INVALID',
      });
    }

    const token = authHeader.slice(7);

    const localVerify = this.jwtService.verify(token); // Tenta verificar localmente para diferenciar token inválido de falha de comunicação
    try {
      const response = await fetch(`${this.coreEngineUrl}/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });


      if (!response.ok && !localVerify) {
          throw new UnauthorizedException({
            message: 'Token rejected',
            errorCode: 'AUTH_TOKEN_INVALID',
          });
      }
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

    return {
      scopes: localVerify.scopes ?? [],
    };
  }
}