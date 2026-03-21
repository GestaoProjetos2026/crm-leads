export class GetStagnantLeadsUseCase {
  constructor({ auditLogRepository }) {
    this.auditLogRepository = auditLogRepository;
  }

  async execute(companyId) {
    // Retrieve all unresolved WEAKNESS_STAGNATION from audit logs
    const stagnations = await this.auditLogRepository.findStagnationsByCompany(companyId);
    return stagnations;
  }
}
