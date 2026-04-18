import { createServer } from 'http';
import { InMemoryStageRepository } from './src/infrastructure/repositories/InMemoryStageRepository.js';
import { InMemoryLeadRepository } from './src/infrastructure/repositories/InMemoryLeadRepository.js';
import { InMemoryAuditLogRepository } from './src/infrastructure/repositories/InMemoryAuditLogRepository.js';
import { ConfigureStageSlaUseCase } from './src/application/use-cases/ConfigureStageSlaUseCase.js';
import { ScanStagnantLeadsUseCase } from './src/application/use-cases/ScanStagnantLeadsUseCase.js';
import { GetStagnantLeadsUseCase } from './src/application/use-cases/GetStagnantLeadsUseCase.js';
import { CalculateConversionLatencyUseCase } from './src/application/use-cases/CalculateConversionLatencyUseCase.js';
import { IngestLeadUseCase } from './src/application/use-cases/IngestLeadUseCase.js';
import { StageController } from './src/interfaces/controllers/StageController.js';
import { AuditController } from './src/interfaces/controllers/AuditController.js';
import { LeadController } from './src/interfaces/controllers/LeadController.js';
import { Router } from './src/infrastructure/web/Router.js';
import { StagnationWorker } from './src/infrastructure/workers/StagnationWorker.js';

import { Stage } from './src/domain/entities/Stage.js';
import { Lead } from './src/domain/entities/Lead.js';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const companyId = 'company-x';

  // 1. Setup Infrastructure
  const stageRepo = new InMemoryStageRepository();
  const leadRepo = new InMemoryLeadRepository();
  const auditRepo = new InMemoryAuditLogRepository();

  // Load Mock Data
  await stageRepo.save(new Stage({ id: 'stage-1', name: 'Triagem', companyId, slaLimit: 2 }));
  await stageRepo.save(new Stage({ id: 'stage-2', name: 'Qualificação', companyId, slaLimit: 24 }));

  await leadRepo.save(new Lead({ id: 'lead-1', currentStageId: 'stage-1', companyId, lastMovedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), email: 'lead1@teste.com' }));
  await leadRepo.save(new Lead({ id: 'lead-2', currentStageId: 'stage-1', companyId, lastMovedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), email: 'lead2@teste.com' }));
  await leadRepo.save(new Lead({ id: 'lead-3', currentStageId: 'stage-2', companyId, lastMovedAt: new Date(Date.now() - 30 * 60 * 60 * 1000), email: 'lead3@teste.com' }));


  // 2. Setup App Layer (Use Cases)
  const configSlaUseCase = new ConfigureStageSlaUseCase({ stageRepository: stageRepo });
  const scanStagnantUseCase = new ScanStagnantLeadsUseCase({
    leadRepository: leadRepo,
    stageRepository: stageRepo,
    auditLogRepository: auditRepo
  });
  const getStagnantUseCase = new GetStagnantLeadsUseCase({ auditLogRepository: auditRepo });
  const latencyUseCase = new CalculateConversionLatencyUseCase({
    auditLogRepository: auditRepo,
    leadRepository: leadRepo
  });
  const ingestLeadUseCase = new IngestLeadUseCase({ leadRepository: leadRepo });

  // 3. Setup Interface Adapters (Controllers)
  const stageController = new StageController(configSlaUseCase);
  const auditController = new AuditController(getStagnantUseCase, latencyUseCase);
  const leadController = new LeadController(ingestLeadUseCase);

  // 4. Setup Web Router
  const router = new Router(stageController, auditController, leadController);

  // 5. Setup Worker
  process.env.WORKER_INTERVAL_MS = '10000';
  const worker = new StagnationWorker({ scanStagnantLeadsUseCase: scanStagnantUseCase, companyIds: [companyId] });
  worker.start();

  // 6. Start Web Server
  const server = createServer((req, res) => {
    router.handleRequest(req, res);
  });

  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Available Endpoints:`);
    console.log(`- POST /v1/config/stages/:id/sla`);
    console.log(`- GET /v1/audit/bottlenecks?companyId=${companyId}`);
    console.log(`- GET /v1/audit/conversion-latency?companyId=${companyId}`);
    console.log(`- POST /v1/leads/ingest (Header obrigatório: x-api-key)`);
  });
}

bootstrap().catch(console.error);