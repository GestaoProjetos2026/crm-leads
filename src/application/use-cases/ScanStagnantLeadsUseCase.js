import { AuditLog } from '../../domain/entities/AuditLog.js';

export class ScanStagnantLeadsUseCase {
  // Adicionamos o eventBus nas dependências
  constructor({ leadRepository, stageRepository, auditLogRepository, eventBus }) {
    this.leadRepository = leadRepository;
    this.stageRepository = stageRepository;
    this.auditLogRepository = auditLogRepository;
    this.eventBus = eventBus; // Injetado para desacoplamento
  }

  async execute(companyId, batchSize = 1000) {
    const stages = await this.stageRepository.findAllByCompany(companyId);
    const stageMap = new Map();
    stages.forEach(stage => stageMap.set(stage.id, stage));

    const candidates = await this.leadRepository.getStagnantCandidates(companyId, batchSize);
    
    let processedCount = 0;
    const errors = [];

    for (const lead of candidates) {
      try {
        const stage = stageMap.get(lead.currentStageId);
        
        if (!stage || stage.slaLimit === null || stage.slaLimit === undefined) {
           continue;
        }

        if (lead.isStagnated(stage.slaLimit)) {
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
             
             // --- RESOLUÇÃO DO TODO ---
             // Disparamos o evento de forma assíncrona (não damos 'await' se não quisermos travar o loop)
             // ou aguardamos se a consistência for crítica.
             if (this.eventBus) {
                this.eventBus.publish('lead.stagnated', {
                  leadId: lead.id,
                  companyId: companyId,
                  stageName: stage.name,
                  elapsedTime: auditLog.elapsedTime,
                  slaLimit: auditLog.slaLimit,
                  occurredAt: new Date()
                });
             }
             // --------------------------
          }
        }
        
        processedCount++;
      } catch (err) {
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

//TO DO FEITO POR JULIANA PALLIN
