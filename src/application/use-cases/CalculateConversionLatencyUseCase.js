export class CalculateConversionLatencyUseCase {
  constructor({ auditLogRepository, leadRepository }) {
    // Note: To accurately calculate true conversion latency between A and B,
    // we would actually need a LeadHistoryRepository not just Audit Logs.
    // For this demonstration/prototype based on the UC06 spec, we are providing a simple stub or basic calculation.
    this.auditLogRepository = auditLogRepository;
    this.leadRepository = leadRepository;
  }

  async execute(companyId, startDate, endDate) {
    // In a real scenario, this would aggregate transition logs (not just stagnation logs)
    // Here we will return a mock structure simulating RF04.
    
    // Example: SELECT avg(time) FROM transition_logs WHERE companyId = ? ... GROUP BY stage_from, stage_to
    
    return [
      { fromStage: 'Triagem', toStage: 'Qualificação', avgLatencyHours: 4.5 },
      { fromStage: 'Qualificação', toStage: 'Proposta', avgLatencyHours: 36.2 },
    ];
  }
}
