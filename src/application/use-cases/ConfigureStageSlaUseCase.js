export class ConfigureStageSlaUseCase {
  constructor({ stageRepository }) {
    this.stageRepository = stageRepository;
  }

  async execute({ stageId, companyId, slaLimitHours }) {
    if (slaLimitHours < 0) {
      throw new Error('SLA limit cannot be negative');
    }

    const stage = await this.stageRepository.findById({ stageId, companyId });
    if (!stage) {
      throw new Error('Stage not found');
    }

    stage.setSlaLimit(slaLimitHours);
    await this.stageRepository.save(stage);

    return stage;
  }
}
