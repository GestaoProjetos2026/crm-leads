import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

/**
 * Guard that validates the `x-api-key` header for public ingest endpoints.
 * The expected key is configured via the `INGEST_API_KEY` env variable.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const apiKey = req.headers['x-api-key'] as string | undefined;

    if (!apiKey) {
      throw new UnauthorizedException(
        'Missing x-api-key header. Provide a valid API key to access this endpoint.',
      );
    }

    const expectedKey = this.configService.get<string>('INGEST_API_KEY');
    if (!expectedKey || apiKey !== expectedKey) {
      throw new UnauthorizedException('Invalid API key.');
    }

    // Extract tenant_id from query string for ingest endpoints
    const tenantId = parseInt(req.query['tenantId'] as string, 10);
    if (!tenantId || isNaN(tenantId)) {
      throw new UnauthorizedException(
        'Missing or invalid tenantId query parameter.',
      );
    }

    // Attach tenantId to the request for downstream use
    (req as any).tenantId = tenantId;
    return true;
  }
}
