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
      WITH stage_durations AS (
        SELECT
          stl.tenant_id,
          stl.to_stage_id AS stage_id,
          s.name AS stage_name,
          s.order_position,
          s.sla_max_hours,
          stl.opportunity_id,
          o.value,
          o.status,
          EXTRACT(EPOCH FROM (
            COALESCE(
              LEAD(stl.transitioned_at) OVER (
                PARTITION BY stl.opportunity_id ORDER BY stl.transitioned_at ASC
              ),
              CASE WHEN o.status = 'Open' THEN NOW() ELSE o.updated_at END
            ) - stl.transitioned_at
          )) / 3600 AS hours_in_stage
        FROM stage_transition_logs stl
        JOIN stages s ON stl.to_stage_id = s.id
        JOIN opportunities o ON stl.opportunity_id = o.id
        WHERE stl.tenant_id = $1
      )
      SELECT
        stage_id AS "stageId",
        stage_name AS "stageName",
        order_position AS "orderPosition",
        ROUND(COALESCE(AVG(hours_in_stage), 0)::numeric, 1) AS "avgHours",
        ROUND(COALESCE(MAX(hours_in_stage), 0)::numeric, 1) AS "maxHours",
        ROUND(COALESCE(MIN(hours_in_stage), 0)::numeric, 1) AS "minHours",
        COUNT(DISTINCT opportunity_id)::int AS "totalOpportunities",
        COUNT(CASE
          WHEN status = 'Open' AND hours_in_stage > sla_max_hours
          THEN 1
        END)::int AS "totalStagnant",
        COALESCE(SUM(CASE
          WHEN status = 'Open' AND hours_in_stage > sla_max_hours
          THEN value
          ELSE 0
        END), 0) AS "totalValueAtRisk"
      FROM stage_durations
      GROUP BY stage_id, stage_name, order_position, sla_max_hours
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