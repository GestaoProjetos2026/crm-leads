export class AuditLog {
  constructor({ leadId, stageId, companyId, slaLimit, elapsedTime, detectedAt }) {
    this.id = crypto.randomUUID(); // Requires crypto module or external ID generation
    this.eventType = 'WEAKNESS_STAGNATION';
    this.leadId = leadId;
    this.stageId = stageId;
    this.companyId = companyId;
    this.slaLimit = slaLimit;
    this.elapsedTime = elapsedTime; // Hours spent
    this.detectedAt = detectedAt || new Date();
  }
}
