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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("./entities/audit-log.entity");
let AuditService = class AuditService {
    auditLogRepository;
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    async getBottlenecks(tenantId) {
        const results = await this.auditLogRepository.query(`
      SELECT
        al.id,
        al.opportunity_id AS "opportunityId",
        al.lead_id AS "leadId",
        COALESCE(l.first_name || ' ' || l.last_name, 'N/A') AS "leadName",
        COALESCE(l.email, 'N/A') AS "leadEmail",
        COALESCE(s.name, 'Desconhecida') AS "stageName",
        al.stage_id AS "stageId",
        al.weakness_type AS "weaknessType",
        al.description,
        ROUND(EXTRACT(EPOCH FROM (NOW() - o.updated_at)) / 3600) AS "hoursStagnant",
        o.value,
        al.created_at AS "detectedAt"
      FROM audit_logs al
      LEFT JOIN opportunities o ON al.opportunity_id = o.id
      LEFT JOIN leads l ON al.lead_id = l.id
      LEFT JOIN stages s ON al.stage_id = s.id
      WHERE al.tenant_id = $1
        AND al.weakness_type = 'Stagnation'
      ORDER BY al.created_at DESC
      LIMIT 100
      `, [tenantId]);
        return results;
    }
    async getConversionLatency(tenantId) {
        const results = await this.auditLogRepository.query(`
      WITH stage_metrics AS (
        SELECT
          s.id AS stage_id,
          s.name AS stage_name,
          s.order_position,
          s.sla_max_hours,
          COUNT(o.id) AS total_opportunities,
          ROUND(AVG(EXTRACT(EPOCH FROM (
            CASE
              WHEN o.status = 'Open' THEN NOW()
              ELSE o.updated_at
            END - o.created_at
          )) / 3600), 1) AS avg_hours,
          ROUND(MAX(EXTRACT(EPOCH FROM (
            CASE
              WHEN o.status = 'Open' THEN NOW()
              ELSE o.updated_at
            END - o.created_at
          )) / 3600), 1) AS max_hours,
          ROUND(MIN(EXTRACT(EPOCH FROM (
            CASE
              WHEN o.status = 'Open' THEN NOW()
              ELSE o.updated_at
            END - o.created_at
          )) / 3600), 1) AS min_hours,
          COUNT(CASE
            WHEN o.status = 'Open'
              AND EXTRACT(EPOCH FROM (NOW() - o.updated_at)) / 3600 > s.sla_max_hours
            THEN 1
          END) AS total_stagnant,
          COALESCE(SUM(CASE
            WHEN o.status = 'Open'
              AND EXTRACT(EPOCH FROM (NOW() - o.updated_at)) / 3600 > s.sla_max_hours
            THEN o.value
            ELSE 0
          END), 0) AS total_value_at_risk
        FROM stages s
        LEFT JOIN opportunities o ON o.stage_id = s.id AND o.tenant_id = s.tenant_id
        WHERE s.tenant_id = $1
        GROUP BY s.id, s.name, s.order_position, s.sla_max_hours
      )
      SELECT
        stage_id AS "stageId",
        stage_name AS "stageName",
        order_position AS "orderPosition",
        COALESCE(avg_hours, 0) AS "avgHours",
        COALESCE(max_hours, 0) AS "maxHours",
        COALESCE(min_hours, 0) AS "minHours",
        total_opportunities AS "totalOpportunities",
        total_stagnant AS "totalStagnant",
        total_value_at_risk AS "totalValueAtRisk"
      FROM stage_metrics
      ORDER BY order_position ASC
      `, [tenantId]);
        return results;
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditService);
//# sourceMappingURL=audit.service.js.map