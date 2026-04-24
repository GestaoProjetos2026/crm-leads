import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
export interface BottleneckDto {
    id: number;
    opportunityId: number;
    leadId: number | null;
    leadName: string;
    leadEmail: string;
    stageName: string;
    stageId: number | null;
    weaknessType: string;
    description: string | null;
    hoursStagnant: number;
    value: number | null;
    detectedAt: string;
}
export interface ConversionLatencyDto {
    stageId: number;
    stageName: string;
    orderPosition: number;
    avgHours: number;
    maxHours: number;
    minHours: number;
    totalOpportunities: number;
    totalStagnant: number;
    totalValueAtRisk: number;
}
export declare class AuditService {
    private readonly auditLogRepository;
    constructor(auditLogRepository: Repository<AuditLog>);
    getBottlenecks(tenantId: number): Promise<BottleneckDto[]>;
    getConversionLatency(tenantId: number): Promise<ConversionLatencyDto[]>;
}
