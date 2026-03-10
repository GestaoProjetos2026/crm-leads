export class InMemoryAuditLogRepository {
  constructor() {
    this.logs = [];
  }

  async save(auditLog) {
    this.logs.push(auditLog);
  }

  async findStagnationsByCompany(companyId) {
    return this.logs.filter(log => log.companyId === companyId && log.eventType === 'WEAKNESS_STAGNATION');
  }

  async hasRecentLogForLead(leadId, stageId) {
    // Simplified: check if an alert for this lead in this specific stage already exists
    return this.logs.some(log => 
      log.leadId === leadId && 
      log.stageId === stageId && 
      log.eventType === 'WEAKNESS_STAGNATION'
    );
  }
}
