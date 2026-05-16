import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { RequestWithTenant } from '../interfaces/request-with-tenant.interface';
import { tenantContext } from '../context/tenant.context';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<RequestWithTenant>();
    const tenantId = req.user?.tenant_id;

    if (tenantId) {
      req.tenantId = tenantId;
      // Executa TODO o restante da requisição dentro do contexto desse tenant
      return tenantContext.run(tenantId, () => next.handle());
    }

    return next.handle();
  }
}