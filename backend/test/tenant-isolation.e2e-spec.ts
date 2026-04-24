import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('Integração de Segurança: Isolamento Multi-tenant (RLS)', () => {
  let dataSource: DataSource;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);
    
    // 1. Criamos um usuário "mortal" (sem superpoderes) se ele não existir
    try {
      await dataSource.query(`CREATE ROLE api_user`);
    } catch (e) { /* Segue o jogo se já existir */ }
    
    // 2. Damos a ele permissão de ler e escrever nas tabelas
    await dataSource.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO api_user`);
    await dataSource.query(`GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO api_user`);
  });

  afterAll(async () => {
    // Agora até a limpeza precisa do crachá do tenant para passar pelo RLS!
    await dataSource.manager.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.current_tenant_id = 1`);
      await manager.query(`DELETE FROM leads WHERE email = 'teste.isolamento@email.com'`);
    });
    
    await app.close();
  });

  it('NÃO deve permitir que o Tenant 2 visualize os leads do Tenant 1', async () => {
    const tenant1Id = 1;
    const tenant2Id = 2;

    // 1. Inserimos o lead logados como Tenant 1
    await dataSource.manager.transaction(async (manager) => {
      // A MÁGICA FINAL: Assumimos a identidade do usuário sem privilégios!
      await manager.query(`SET ROLE api_user`); 
      await manager.query(`SET LOCAL app.current_tenant_id = ${tenant1Id}`);
      
      await manager.query(`DELETE FROM leads WHERE email = 'teste.isolamento@email.com'`);
      
      await manager.query(`
        INSERT INTO leads (tenant_id, first_name, last_name, email, source) 
        VALUES (${tenant1Id}, 'Lead', 'Isolado', 'teste.isolamento@email.com', 'test_suite')
      `);
    });

    // 2. Buscamos como Tenant 1 (DEVE ENCONTRAR)
    await dataSource.manager.transaction(async (manager) => {
      await manager.query(`SET ROLE api_user`);
      await manager.query(`SET LOCAL app.current_tenant_id = ${tenant1Id}`);
      
      const result = await manager.query(
        `SELECT * FROM leads WHERE email = 'teste.isolamento@email.com'`
      );
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].tenant_id).toBe(tenant1Id);
    });

    // 3. Buscamos o MESMO lead logados como Tenant 2 (NÃO PODE ENCONTRAR)
    await dataSource.manager.transaction(async (manager) => {
      await manager.query(`SET ROLE api_user`);
      await manager.query(`SET LOCAL app.current_tenant_id = ${tenant2Id}`);
      
      const result = await manager.query(
        `SELECT * FROM leads WHERE email = 'teste.isolamento@email.com'`
      );
      
      // O usuário comum bate na parede do RLS e retorna vazio!
      expect(result.length).toBe(0); 
    });
  });
});