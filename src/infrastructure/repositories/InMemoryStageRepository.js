import { Stage } from '../../domain/entities/Stage.js';

export class InMemoryStageRepository {
  constructor() {
    this.stages = [];
  }

  async findById({ stageId, companyId }) {
    const stage = this.stages.find(s => s.id === stageId && s.companyId === companyId);
    return stage ? new Stage(stage) : null;
  }

  async save(stage) {
    const index = this.stages.findIndex(s => s.id === stage.id && s.companyId === stage.companyId);
    if (index !== -1) {
      this.stages[index] = stage;
    } else {
      this.stages.push(stage);
    }
  }

  async findAllByCompany(companyId) {
    return this.stages
      .filter(s => s.companyId === companyId)
      .map(stage => new Stage(stage));
  }
}
