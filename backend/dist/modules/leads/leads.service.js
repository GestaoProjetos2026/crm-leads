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
var LeadsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lead_entity_1 = require("./entities/lead.entity");
const opportunity_entity_1 = require("../opportunities/entities/opportunity.entity");
const stage_entity_1 = require("../stages/entities/stage.entity");
const stage_transition_log_entity_1 = require("../opportunities/entities/stage-transition-log.entity");
let LeadsService = LeadsService_1 = class LeadsService {
    leadsRepository;
    opportunityRepository;
    stageRepository;
    transitionLogRepository;
    logger = new common_1.Logger(LeadsService_1.name);
    constructor(leadsRepository, opportunityRepository, stageRepository, transitionLogRepository) {
        this.leadsRepository = leadsRepository;
        this.opportunityRepository = opportunityRepository;
        this.stageRepository = stageRepository;
        this.transitionLogRepository = transitionLogRepository;
    }
    async ingestLead(tenantId, dto) {
        const existingLead = await this.leadsRepository.findOne({
            where: { email: dto.email, tenantId },
        });
        if (existingLead) {
            throw new common_1.ConflictException(`Lead with email "${dto.email}" already exists for this tenant.`);
        }
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
        const firstStage = await this.stageRepository.findOne({
            where: { tenantId },
            order: { orderPosition: 'ASC' },
        });
        const firstStageId = firstStage?.id ?? 1;
        const opportunity = this.opportunityRepository.create({
            tenantId,
            leadId: savedLead.id,
            stageId: firstStageId,
            status: 'Open',
        });
        const savedOpportunity = await this.opportunityRepository.save(opportunity);
        this.logger.log(`Opportunity created: id=${savedOpportunity.id} stage=${firstStage?.name ?? 'default'}`);
        const transitionLog = this.transitionLogRepository.create({
            tenantId,
            opportunityId: savedOpportunity.id,
            fromStageId: null,
            toStageId: firstStageId,
        });
        await this.transitionLogRepository.save(transitionLog);
        this.logger.log(`Transition log created: opportunity=${savedOpportunity.id} → stage=${firstStage?.name ?? 'default'}`);
        return { lead: savedLead, opportunity: savedOpportunity };
    }
    async findByTenant(tenantId) {
        return this.leadsRepository.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = LeadsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __param(1, (0, typeorm_1.InjectRepository)(opportunity_entity_1.Opportunity)),
    __param(2, (0, typeorm_1.InjectRepository)(stage_entity_1.Stage)),
    __param(3, (0, typeorm_1.InjectRepository)(stage_transition_log_entity_1.StageTransitionLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LeadsService);
//# sourceMappingURL=leads.service.js.map