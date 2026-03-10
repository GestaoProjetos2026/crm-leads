export class IAuditLogRepository {
  async save(auditLog) { throw new Error('Not implemented'); }
  
  // Find all WEAKNESS_STAGNATION alerts for a company
  async findStagnationsByCompany(companyId) { throw new Error('Not implemented'); }

  // Useful to enforce idempotency
  async hasRecentLogForLead(leadId, stageId) { throw new Error('Not implemented'); }
}
