import { AuditLog } from '../../domain/entities/AuditLog.js';

export class ScanStagnantLeadsUseCase {
  constructor({ leadRepository, stageRepository, auditLogRepository }) {
    this.leadRepository = leadRepository;
    this.stageRepository = stageRepository;
    this.auditLogRepository = auditLogRepository;
  }

  async execute(companyId, batchSize = 1000) {
    // 1. Get all stages for the company so we know the SLA limits
    const stages = await this.stageRepository.findAllByCompany(companyId);
    const stageMap = new Map();
    stages.forEach(stage => stageMap.set(stage.id, stage));

    // 2. Fetch candidates in batches
    const candidates = await this.leadRepository.getStagnantCandidates(companyId, batchSize);
    
    let processedCount = 0;
    const errors = [];

    // 3. Process each lead
    for (const lead of candidates) {
      try {
        const stage = stageMap.get(lead.currentStageId);
        
        // If stage not found or no SLA configured, we can't check stagnation. Skip.
        if (!stage || stage.slaLimit === null || stage.slaLimit === undefined) {
           continue;
        }

        if (lead.isStagnated(stage.slaLimit)) {
          // Idempotency Check: Do we already have an active/recent stagnation log?
          const alreadyLogged = await this.auditLogRepository.hasRecentLogForLead(lead.id, lead.currentStageId);
          
          if (!alreadyLogged) {
             const auditLog = new AuditLog({
               leadId: lead.id,
               stageId: stage.id,
               companyId: companyId,
               slaLimit: stage.slaLimit,
               elapsedTime: lead.getElapsedHours()
             });

             await this.auditLogRepository.save(auditLog);
             
             // TODO: In a real system, you might trigger a Webhook / Event here:
             // eventBus.publish('lead.stagnated', auditLog);
          }
        }
        
        processedCount++;
      } catch (err) {
        // Log error but continue batch
        console.error(`Error processing lead ${lead.id}:`, err);
        errors.push({ leadId: lead.id, error: err.message });
      }
    }

    return {
      processed: processedCount,
      errors: errors
    };
  }
}
