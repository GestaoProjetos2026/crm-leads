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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Opportunity = void 0;
const typeorm_1 = require("typeorm");
const lead_entity_1 = require("../../leads/entities/lead.entity");
const stage_entity_1 = require("../../stages/entities/stage.entity");
let Opportunity = class Opportunity {
    id;
    tenantId;
    leadId;
    stageId;
    assignedUserId;
    value;
    status;
    lostReason;
    expectedCloseDate;
    createdAt;
    updatedAt;
    lead;
    stage;
};
exports.Opportunity = Opportunity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Opportunity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'int' }),
    __metadata("design:type", Number)
], Opportunity.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_id', type: 'int' }),
    __metadata("design:type", Number)
], Opportunity.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stage_id', type: 'int' }),
    __metadata("design:type", Number)
], Opportunity.prototype, "stageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_user_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Opportunity.prototype, "assignedUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], Opportunity.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Open', type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], Opportunity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lost_reason', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Opportunity.prototype, "lostReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_close_date', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Opportunity.prototype, "expectedCloseDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Opportunity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Opportunity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.Lead, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'lead_id' }),
    __metadata("design:type", lead_entity_1.Lead)
], Opportunity.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => stage_entity_1.Stage),
    (0, typeorm_1.JoinColumn)({ name: 'stage_id' }),
    __metadata("design:type", stage_entity_1.Stage)
], Opportunity.prototype, "stage", void 0);
exports.Opportunity = Opportunity = __decorate([
    (0, typeorm_1.Entity)('opportunities')
], Opportunity);
//# sourceMappingURL=opportunity.entity.js.map