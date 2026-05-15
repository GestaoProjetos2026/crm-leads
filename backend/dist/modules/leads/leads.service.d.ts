import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { Opportunity } from '../opportunities/entities/opportunity.entity';
import { Stage } from '../stages/entities/stage.entity';
import { StageTransitionLog } from '../opportunities/entities/stage-transition-log.entity';
import { IngestLeadDto } from './dto/ingest-lead.dto';
export declare class LeadsService {
    private readonly leadsRepository;
    private readonly opportunityRepository;
    private readonly stageRepository;
    private readonly transitionLogRepository;
    private readonly logger;
    constructor(leadsRepository: Repository<Lead>, opportunityRepository: Repository<Opportunity>, stageRepository: Repository<Stage>, transitionLogRepository: Repository<StageTransitionLog>);
    ingestLead(tenantId: number, dto: IngestLeadDto): Promise<{
        lead: Lead;
        opportunity: Opportunity;
    }>;
    findByTenant(tenantId: number): Promise<Lead[]>;
}
