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
import { IngestLeadDto } from './dto/ingest-lead.dto';

/**
 * LeadsService — handles lead ingest with deduplication and auto-pipeline placement.
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
  ) {}

  /**
   * Ingest a new lead from an external source.
   * - Deduplicates by email + tenantId
   * - Automatically creates an Opportunity in the first pipeline stage
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

    // 4. Create an opportunity in the first stage
    const opportunity = this.opportunityRepository.create({
      tenantId,
      leadId: savedLead.id,
      stageId: firstStage?.id ?? 1,
      status: 'Open',
    });

    const savedOpportunity =
      await this.opportunityRepository.save(opportunity);
    this.logger.log(
      `Opportunity created: id=${savedOpportunity.id} stage=${firstStage?.name ?? 'default'}`,
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
