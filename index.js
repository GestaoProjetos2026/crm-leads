/**
 * SalesWeakness — Entry point documentation
 *
 * The real application entry point is: backend/src/main.ts
 *
 * To start the application:
 *   cd backend && npm run start:dev
 *
 * The stagnation engine runs automatically via @Cron every 10 minutes
 * and operates entirely on real database data (PostgreSQL via TypeORM).
 *
 * Available Endpoints:
 *   - POST   /v1/leads/ingest              (Header: x-api-key)
 *   - PATCH  /v1/deals/:id/stage           (Move opportunity between stages)
 *   - PATCH  /v1/config/stages/:id/sla     (Configure SLA threshold)
 *   - GET    /v1/audit/bottlenecks         (?companyId=N)
 *   - GET    /v1/audit/conversion-latency  (?companyId=N)
 */
console.log('SalesWeakness — Ponto de entrada real: backend/src/main.ts');
console.log('Execute: cd backend && npm run start:dev');