"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const leads_service_1 = require("./leads.service");
const ingest_lead_dto_1 = require("./dto/ingest-lead.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const api_key_guard_1 = require("../../common/guards/api-key.guard");
const tenant_decorator_1 = require("../../common/decorators/tenant.decorator");
let LeadsController = class LeadsController {
    leadsService;
    constructor(leadsService) {
        this.leadsService = leadsService;
    }
    async ingest(dto, req) {
        const tenantId = req.tenantId;
        return this.leadsService.ingestLead(tenantId, dto);
    }
    async findAll(tenantId) {
        return this.leadsService.findByTenant(tenantId);
    }
};
exports.LeadsController = LeadsController;
__decorate([
    (0, common_1.Post)('ingest'),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Ingest a lead from an external source',
        description: 'Receives lead data from Facebook Leads, Landing Pages, etc. ' +
            'Requires x-api-key header and tenantId query parameter.',
    }),
    (0, swagger_1.ApiHeader)({
        name: 'x-api-key',
        description: 'API Key for authentication',
        required: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Lead ingested successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid or missing API key',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Lead with this email already exists',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ingest_lead_dto_1.IngestLeadDto, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "ingest", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all leads for the authenticated tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of leads' }),
    __param(0, (0, tenant_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "findAll", null);
exports.LeadsController = LeadsController = __decorate([
    (0, swagger_1.ApiTags)('leads'),
    (0, common_1.Controller)('leads'),
    __metadata("design:paramtypes", [leads_service_1.LeadsService])
], LeadsController);
//# sourceMappingURL=leads.controller.js.map