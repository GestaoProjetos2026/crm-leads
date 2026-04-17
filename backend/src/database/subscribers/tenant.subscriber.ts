import {
  EventSubscriber,
  EntitySubscriberInterface,
  TransactionStartEvent,
} from 'typeorm';
import { tenantContext } from '../../common/context/tenant.context';

@EventSubscriber()
export class TenantSubscriber implements EntitySubscriberInterface {
  
  /**
   * Esse evento é disparado pelo TypeORM automaticamente
   * sempre que uma nova transação com o banco de dados é iniciada.
   */
  async beforeTransactionStart(event: TransactionStartEvent): Promise<void> {
    // Busca o ID que o Interceptor guardou na ponte
    const tenantId = tenantContext.getStore();

    if (tenantId) {
      // Injeta a variável de forma segura no PostgreSQL ativando o RLS
      await event.queryRunner.query(
        `SET LOCAL app.current_tenant_id = ${tenantId}`
      );
    }
  }
}