import { Opportunity } from '../../opportunities/entities/opportunity.entity';
export declare class AuditLog {
    id: number;
    tenantId: number;
    opportunityId: number;
    leadId: number | null;
    stageId: number | null;
    weaknessType: string;
    description: string | null;
    createdAt: Date;
    opportunity: Opportunity;
}
