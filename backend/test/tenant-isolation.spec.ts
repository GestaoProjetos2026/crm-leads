import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { tenantContext } from '../src/common/context/tenant.context';

describe('Integração de Segurança: Isolamento Multi-tenant (RLS)', () => {
  let dataSource: DataSource;
  let app: INestApplication;

  beforeAll(async () => {
    // Sobe o módulo principal da aplicação para conectar no banco
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    // Limpa o dado de teste desabilitando o RLS temporariamente
    await dataSource.query(`DELETE FROM leads WHERE email = 'teste.isolamento@email.com'`);
    await app.close();
  });

  it('NÃO deve permitir que o Tenant 2 visualize os leads do Tenant 1', async () => {
    const tenant1Id = 1;
    const tenant2Id = 2;

    // 1. Inserimos um lead logados como Tenant 1
    await tenantContext.run(tenant1Id, async () => {
      // O TypeOrm vai disparar nosso Subscriber e setar o current_tenant_id = 1
      await dataSource.query(`
        INSERT INTO leads (tenant_id, first_name, last_name, email, source) 
        VALUES (1, 'Lead', 'Isolado', 'teste.isolamento@email.com', 'test_suite')
      `);
    });

    // 2. Buscamos o lead logados como Tenant 1 (DEVE ENCONTRAR)
    await tenantContext.run(tenant1Id, async () => {
      const result = await dataSource.query(
        `SELECT * FROM leads WHERE email = 'teste.isolamento@email.com'`
      );
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].tenant_id).toBe(tenant1Id);
    });

    // 3. Buscamos o MESMO lead logados como Tenant 2 (NÃO PODE ENCONTRAR)
    await tenantContext.run(tenant2Id, async () => {
      const result = await dataSource.query(
        `SELECT * FROM leads WHERE email = 'teste.isolamento@email.com'`
      );
      // A mágica do RLS: retorna um array vazio, provando que o isolamento funciona!
      expect(result.length).toBe(0); 
    });
  });
});