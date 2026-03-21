export class CalculateConversionLatencyUseCase {
  constructor({ auditLogRepository, leadRepository }) {
    this.auditLogRepository = auditLogRepository;
    this.leadRepository = leadRepository;
  }

  async execute(companyId, startDate, endDate) {
    // 1. Busca os logs de transição no período especificado
    const logs = await this.auditLogRepository.findTransitionsByCompany(
      companyId, 
      startDate, 
      endDate
    );

    if (!logs || logs.length === 0) {
      return [];
    }

    // 2. Agrupa as transições e acumula os tempos (em milissegundos)
    // Estrutura: { "Triagem->Qualificação": { totalMs: 5000, count: 2 } }
    const aggregations = logs.reduce((acc, log) => {
      const key = `${log.fromStage}->${log.toStage}`;
      
      if (!acc[key]) {
        acc[key] = { fromStage: log.fromStage, toStage: log.toStage, totalMs: 0, count: 0 };
      }

      // Calcula a diferença entre a criação do log e quando o lead entrou no estágio anterior
      // Se o log não tiver 'duration', calculamos via timestamps
      const duration = log.durationMs || (new Date(log.createdAt) - new Date(log.enteredStageAt));
      
      acc[key].totalMs += duration;
      acc[key].count += 1;
      
      return acc;
    }, {});

    // 3. Formata o resultado calculando a média em horas
    return Object.values(aggregations).map(group => ({
      fromStage: group.fromStage,
      toStage: group.toStage,
      avgLatencyHours: parseFloat((group.totalMs / (1000 * 60 * 60) / group.count).toFixed(2))
    }));
  }
}
//TO DO POR JULIANA PALLIN