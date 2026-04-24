import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getBottlenecks(companyId: number): Promise<import("./audit.service").BottleneckDto[]>;
    getConversionLatency(companyId: number): Promise<import("./audit.service").ConversionLatencyDto[]>;
}
