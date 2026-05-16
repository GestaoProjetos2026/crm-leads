import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stage } from './entities/stage.entity';

@Injectable()
export class StagesService {
  constructor(
    @InjectRepository(Stage)
    private readonly stagesRepository: Repository<Stage>,
  ) {}

  async findByTenant(tenantId: number): Promise<Stage[]> {
    return this.stagesRepository.find({
      where: { tenantId },
      order: { orderPosition: 'ASC' },
    });
  }

  async findFirstStage(tenantId: number): Promise<Stage | null> {
    return this.stagesRepository.findOne({
      where: { tenantId },
      order: { orderPosition: 'ASC' },
    });
  }

  async updateSla(
    tenantId: number,
    stageId: number,
    slaMaxHours: number,
  ): Promise<Stage | null> {
    await this.stagesRepository.update(
      { id: stageId, tenantId },
      { slaMaxHours },
    );
    return this.stagesRepository.findOne({
      where: { id: stageId, tenantId },
    });
  }
}
