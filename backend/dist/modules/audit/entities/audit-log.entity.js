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
exports.AuditLog = void 0;
const typeorm_1 = require("typeorm");
const opportunity_entity_1 = require("../../opportunities/entities/opportunity.entity");
let AuditLog = class AuditLog {
    id;
    tenantId;
    opportunityId;
    leadId;
    stageId;
    weaknessType;
    description;
    createdAt;
    opportunity;
};
exports.AuditLog = AuditLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AuditLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'int' }),
    __metadata("design:type", Number)
], AuditLog.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'opportunity_id', type: 'int' }),
    __metadata("design:type", Number)
], AuditLog.prototype, "opportunityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stage_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "stageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'weakness_type', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], AuditLog.prototype, "weaknessType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], AuditLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => opportunity_entity_1.Opportunity),
    (0, typeorm_1.JoinColumn)({ name: 'opportunity_id' }),
    __metadata("design:type", opportunity_entity_1.Opportunity)
], AuditLog.prototype, "opportunity", void 0);
exports.AuditLog = AuditLog = __decorate([
    (0, typeorm_1.Entity)('audit_logs')
], AuditLog);
//# sourceMappingURL=audit-log.entity.js.map