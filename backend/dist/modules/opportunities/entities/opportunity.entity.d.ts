import { Lead } from '../../leads/entities/lead.entity';
import { Stage } from '../../stages/entities/stage.entity';
export declare class Opportunity {
    id: number;
    tenantId: number;
    leadId: number;
    stageId: number;
    assignedUserId: number | null;
    value: number | null;
    status: string;
    lostReason: string | null;
    expectedCloseDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    lead: Lead;
    stage: Stage;
}
