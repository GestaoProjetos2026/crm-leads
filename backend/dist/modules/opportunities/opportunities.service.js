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
exports.OpportunitiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const opportunity_entity_1 = require("./entities/opportunity.entity");
const stage_transition_log_entity_1 = require("./entities/stage-transition-log.entity");
let OpportunitiesService = class OpportunitiesService {
    opportunitiesRepository;
    transitionLogRepository;
    constructor(opportunitiesRepository, transitionLogRepository) {
        this.opportunitiesRepository = opportunitiesRepository;
        this.transitionLogRepository = transitionLogRepository;
    }
    async moveStage(tenantId, opportunityId, newStageId) {
        const opportunity = await this.opportunitiesRepository.findOne({
            where: { id: opportunityId, tenantId },
        });
        if (!opportunity) {
            throw new common_1.NotFoundException(`Opportunity #${opportunityId} not found for tenant ${tenantId}`);
        }
        const fromStageId = opportunity.stageId;
        opportunity.stageId = newStageId;
        const saved = await this.opportunitiesRepository.save(opportunity);
        const transitionLog = this.transitionLogRepository.create({
            tenantId,
            opportunityId,
            fromStageId,
            toStageId: newStageId,
        });
        await this.transitionLogRepository.save(transitionLog);
        return saved;
    }
};
exports.OpportunitiesService = OpportunitiesService;
exports.OpportunitiesService = OpportunitiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(opportunity_entity_1.Opportunity)),
    __param(1, (0, typeorm_1.InjectRepository)(stage_transition_log_entity_1.StageTransitionLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OpportunitiesService);
//# sourceMappingURL=opportunities.service.js.map