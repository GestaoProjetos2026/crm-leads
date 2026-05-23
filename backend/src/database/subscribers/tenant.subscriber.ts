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
    // DESATIVADO: A injeção do RLS agora é gerenciada globalmente pelo rls.plugin.ts.
    // O evento beforeTransactionStart do TypeORM omitia o RLS para consultas de leitura (.find()).
    /*
    const tenantId = tenantContext.getStore();
    if (tenantId) {
      await event.queryRunner.query(
        \`SET LOCAL app.current_tenant_id = \${tenantId}\`
      );
    }
    */
  }
}