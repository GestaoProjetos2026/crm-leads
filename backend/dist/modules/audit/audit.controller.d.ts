import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getBottlenecks(tenantId: number): Promise<import("./audit.service").BottleneckDto[]>;
    getConversionLatency(tenantId: number): Promise<import("./audit.service").ConversionLatencyDto[]>;
}
