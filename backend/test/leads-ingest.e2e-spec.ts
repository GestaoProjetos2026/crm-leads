import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { StagnationWorker } from '../src/modules/worker/stagnation.worker';

/**
 * E2E Test: Lead Ingest → Stagnation Worker → Audit Log
 *
 * Flow:
 * 1. POST /v1/leads/ingest → Lead created (201)
 * 2. Manipulate updated_at in DB to simulate passage of time
 * 3. Trigger stagnation worker manually
 * 4. GET /v1/audit/bottlenecks → Verify audit log was created
 * 5. Re-trigger worker → Verify idempotency (no duplicate)
 */
describe('Lead Ingest + Stagnation Worker E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let authToken: string;

  const API_KEY = process.env.INGEST_API_KEY || 'sw-dev-api-key-2026';
  const TENANT_ID = 1;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    dataSource = app.get(DataSource);
    jwtService = app.get(JwtService);
    
    // Generate valid token for the test tenant
    authToken = jwtService.sign({
      sub: 1,
      tenant_id: TENANT_ID,
      profile: 'director',
      scopes: ['analytics:read'],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /v1/leads/ingest', () => {
    it('should reject without x-api-key', async () => {
      const response = await supertest(app.getHttpServer())
        .post(`/v1/leads/ingest?tenantId=${TENANT_ID}`)
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test-nokey@example.com',
          source: 'test',
        });

      expect(response.status).toBe(401);
    });

    it('should reject with invalid API key', async () => {
      const response = await supertest(app.getHttpServer())
        .post(`/v1/leads/ingest?tenantId=${TENANT_ID}`)
        .set('x-api-key', 'invalid-key')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test-badkey@example.com',
          source: 'test',
        });

      expect(response.status).toBe(401);
    });

    it('should reject without tenantId query param', async () => {
      const response = await supertest(app.getHttpServer())
        .post('/v1/leads/ingest')
        .set('x-api-key', API_KEY)
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test-notenant@example.com',
          source: 'test',
        });

      expect(response.status).toBe(401);
    });

    it('should reject invalid payload (missing required fields)', async () => {
      const response = await supertest(app.getHttpServer())
        .post(`/v1/leads/ingest?tenantId=${TENANT_ID}`)
        .set('x-api-key', API_KEY)
        .send({
          firstName: 'Test',
          // missing lastName, email, source
        });

      expect(response.status).toBe(400);
    });

    it('should ingest a lead successfully (201)', async () => {
      const response = await supertest(app.getHttpServer())
        .post(`/v1/leads/ingest?tenantId=${TENANT_ID}`)
        .set('x-api-key', API_KEY)
        .send({
          firstName: 'E2E',
          lastName: 'TestLead',
          email: `e2e-${Date.now()}@example.com`,
          source: 'e2e_test',
          campaignId: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body.lead).toBeDefined();
      expect(response.body.lead.id).toBeDefined();
      expect(response.body.opportunity).toBeDefined();
      expect(response.body.opportunity.status).toBe('Open');
    });

    it('should reject duplicate email for same tenant (409)', async () => {
      const uniqueEmail = `duplicate-${Date.now()}@example.com`;

      // First ingest
      await supertest(app.getHttpServer())
        .post(`/v1/leads/ingest?tenantId=${TENANT_ID}`)
        .set('x-api-key', API_KEY)
        .send({
          firstName: 'Dup',
          lastName: 'Test',
          email: uniqueEmail,
          source: 'test',
        });

      // Duplicate ingest
      const response = await supertest(app.getHttpServer())
        .post(`/v1/leads/ingest?tenantId=${TENANT_ID}`)
        .set('x-api-key', API_KEY)
        .send({
          firstName: 'Dup',
          lastName: 'Test',
          email: uniqueEmail,
          source: 'test',
        });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /v1/audit/bottlenecks', () => {
    it('should return bottlenecks for the tenant', async () => {
      const response = await supertest(app.getHttpServer())
        .get(`/v1/audit/bottlenecks`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /v1/audit/conversion-latency', () => {
    it('should return conversion latency per stage', async () => {
      const response = await supertest(app.getHttpServer())
        .get(`/v1/audit/conversion-latency`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Stagnation Worker Simulation', () => {
    it('should detect stagnant leads and create audit logs', async () => {
      // 1. Ingest a lead
      const email = `worker-test-${Date.now()}@example.com`;
      const ingestResponse = await supertest(app.getHttpServer())
        .post(`/v1/leads/ingest?tenantId=${TENANT_ID}`)
        .set('x-api-key', API_KEY)
        .send({
          firstName: 'Worker',
          lastName: 'Test',
          email,
          source: 'e2e_test',
        });

      const opportunityId = ingestResponse.body.opportunity.id as number;

      // 2. Manipulate updated_at to simulate 72h of stagnation
      await dataSource.query(
        `UPDATE opportunities SET updated_at = NOW() - INTERVAL '72 hours' WHERE id = $1`,
        [opportunityId],
      );

      // 3. Count audit logs BEFORE worker runs
      const beforeCount: Array<{ count: string }> = await dataSource.query(
        `SELECT COUNT(*) as count FROM audit_logs WHERE opportunity_id = $1 AND weakness_type = 'Stagnation'`,
        [opportunityId],
      );

      // 4. Manually trigger the worker
      const worker = app.get(StagnationWorker);
      await worker.scanStagnantLeads();

      // 5. Verify audit log was created
      const afterCount: Array<{ count: string }> = await dataSource.query(
        `SELECT COUNT(*) as count FROM audit_logs WHERE opportunity_id = $1 AND weakness_type = 'Stagnation'`,
        [opportunityId],
      );

      expect(parseInt(afterCount[0].count)).toBeGreaterThan(
        parseInt(beforeCount[0].count),
      );

      // 6. Run worker again — should NOT create duplicate (idempotency)
      await worker.scanStagnantLeads();

      const finalCount: Array<{ count: string }> = await dataSource.query(
        `SELECT COUNT(*) as count FROM audit_logs WHERE opportunity_id = $1 AND weakness_type = 'Stagnation'`,
        [opportunityId],
      );

      expect(parseInt(finalCount[0].count)).toBe(
        parseInt(afterCount[0].count),
      );
    });
  });
});
