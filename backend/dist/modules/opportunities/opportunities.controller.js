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
exports.OpportunitiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const opportunities_service_1 = require("./opportunities.service");
const tenant_decorator_1 = require("../../common/decorators/tenant.decorator");
let OpportunitiesController = class OpportunitiesController {
    opportunitiesService;
    constructor(opportunitiesService) {
        this.opportunitiesService = opportunitiesService;
    }
    async moveStage(tenantId, opportunityId, newStageId) {
        return this.opportunitiesService.moveStage(tenantId, opportunityId, newStageId);
    }
};
exports.OpportunitiesController = OpportunitiesController;
__decorate([
    (0, common_1.Patch)(':id/stage'),
    (0, swagger_1.ApiOperation)({
        summary: 'Move an opportunity to a new pipeline stage',
        description: 'Updates the opportunity stage and records a transition log ' +
            'for conversion-latency analytics.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stage updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Opportunity not found' }),
    __param(0, (0, tenant_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)('stageId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], OpportunitiesController.prototype, "moveStage", null);
exports.OpportunitiesController = OpportunitiesController = __decorate([
    (0, swagger_1.ApiTags)('opportunities'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('deals'),
    __metadata("design:paramtypes", [opportunities_service_1.OpportunitiesService])
], OpportunitiesController);
//# sourceMappingURL=opportunities.controller.js.map