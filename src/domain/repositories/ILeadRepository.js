export class ILeadRepository {
  async findById(id) { throw new Error('Not implemented'); }
  async findAllByCompany(companyId) { throw new Error('Not implemented'); }
  async getLeadsByStage(stageId) { throw new Error('Not implemented'); }
  async getStagnantCandidates(companyId, batchSize = 1000) { throw new Error('Not implemented'); }
}
