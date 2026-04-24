import { LeadsService } from './leads.service';
import { IngestLeadDto } from './dto/ingest-lead.dto';
import type { Request } from 'express';
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    ingest(dto: IngestLeadDto, req: Request): Promise<{
        lead: import("./entities/lead.entity").Lead;
        opportunity: import("../opportunities/entities/opportunity.entity").Opportunity;
    }>;
    findAll(tenantId: number): Promise<import("./entities/lead.entity").Lead[]>;
}
