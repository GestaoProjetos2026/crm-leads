import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from './entities/opportunity.entity';
import { StageTransitionLog } from './entities/stage-transition-log.entity';

/**
 * OpportunitiesService — manages opportunities and tracks stage transitions.
 *
 * moveStage() updates the opportunity's stage AND records a transition log
 * entry, enabling accurate conversion-latency analytics via LEAD() OVER.
 */
@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunitiesRepository: Repository<Opportunity>,

    @InjectRepository(StageTransitionLog)
    private readonly transitionLogRepository: Repository<StageTransitionLog>,
  ) {}

  /**
   * Move an opportunity to a new pipeline stage.
   * Records a StageTransitionLog entry for conversion-latency calculation.
   *
   * @throws NotFoundException if opportunity not found for tenant
   */
  async moveStage(
    tenantId: number,
    opportunityId: number,
    newStageId: number,
  ): Promise<Opportunity> {
    const opportunity = await this.opportunitiesRepository.findOne({
      where: { id: opportunityId, tenantId },
    });

    if (!opportunity) {
      throw new NotFoundException(
        `Opportunity #${opportunityId} not found for tenant ${tenantId}`,
      );
    }

    const fromStageId = opportunity.stageId;

    // Update the opportunity's current stage
    opportunity.stageId = newStageId;
    const saved = await this.opportunitiesRepository.save(opportunity);

    // Record the transition log for analytics
    const transitionLog = this.transitionLogRepository.create({
      tenantId,
      opportunityId,
      fromStageId,
      toStageId: newStageId,
    });
    await this.transitionLogRepository.save(transitionLog);

    return saved;
  }
}
