import {
  Injectable,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { Opportunity } from '../opportunities/entities/opportunity.entity';
import { Stage } from '../stages/entities/stage.entity';
import { StageTransitionLog } from '../opportunities/entities/stage-transition-log.entity';
import { IngestLeadDto } from './dto/ingest-lead.dto';

/**
 * LeadsService — handles lead ingest with deduplication and auto-pipeline placement.
 * Records an initial StageTransitionLog entry when placing a lead in the first stage.
 */
@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectRepository(Lead)
    private readonly leadsRepository: Repository<Lead>,

    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,

    @InjectRepository(Stage)
    private readonly stageRepository: Repository<Stage>,

    @InjectRepository(StageTransitionLog)
    private readonly transitionLogRepository: Repository<StageTransitionLog>,
  ) {}

  /**
   * Ingest a new lead from an external source.
   * - Deduplicates by email + tenantId
   * - Automatically creates an Opportunity in the first pipeline stage
   * - Records the initial stage transition log (fromStageId: null → firstStage)
   */
  async ingestLead(
    tenantId: number,
    dto: IngestLeadDto,
  ): Promise<{ lead: Lead; opportunity: Opportunity }> {
    // 1. Deduplication check
    const existingLead = await this.leadsRepository.findOne({
      where: { email: dto.email, tenantId },
    });

    if (existingLead) {
      throw new ConflictException(
        `Lead with email "${dto.email}" already exists for this tenant.`,
      );
    }

    // 2. Create the lead
    const lead = this.leadsRepository.create({
      tenantId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      source: dto.source,
      campaignId: dto.campaignId ?? null,
    });

    const savedLead = await this.leadsRepository.save(lead);
    this.logger.log(`Lead created: id=${savedLead.id} tenant=${tenantId}`);

    // 3. Find the first stage for this tenant (lowest order_position)
    const firstStage = await this.stageRepository.findOne({
      where: { tenantId },
      order: { orderPosition: 'ASC' },
    });

    const firstStageId = firstStage?.id ?? 1;

    // 4. Create an opportunity in the first stage
    const opportunity = this.opportunityRepository.create({
      tenantId,
      leadId: savedLead.id,
      stageId: firstStageId,
      status: 'Open',
    });

    const savedOpportunity =
      await this.opportunityRepository.save(opportunity);
    this.logger.log(
      `Opportunity created: id=${savedOpportunity.id} stage=${firstStage?.name ?? 'default'}`,
    );

    // 5. Record the initial stage transition log (entry into the pipeline)
    const transitionLog = this.transitionLogRepository.create({
      tenantId,
      opportunityId: savedOpportunity.id,
      fromStageId: null, // Initial placement — no previous stage
      toStageId: firstStageId,
    });
    await this.transitionLogRepository.save(transitionLog);
    this.logger.log(
      `Transition log created: opportunity=${savedOpportunity.id} → stage=${firstStage?.name ?? 'default'}`,
    );

    return { lead: savedLead, opportunity: savedOpportunity };
  }

  /**
   * List all leads for a tenant.
   */
  async findByTenant(tenantId: number): Promise<Lead[]> {
    return this.leadsRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }
}
