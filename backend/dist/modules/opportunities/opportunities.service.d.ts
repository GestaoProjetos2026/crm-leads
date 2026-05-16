import { Repository } from 'typeorm';
import { Opportunity } from './entities/opportunity.entity';
import { StageTransitionLog } from './entities/stage-transition-log.entity';
export declare class OpportunitiesService {
    private readonly opportunitiesRepository;
    private readonly transitionLogRepository;
    constructor(opportunitiesRepository: Repository<Opportunity>, transitionLogRepository: Repository<StageTransitionLog>);
    moveStage(tenantId: number, opportunityId: number, newStageId: number): Promise<Opportunity>;
}
