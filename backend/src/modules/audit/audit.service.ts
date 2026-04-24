import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

/**
 * Bottleneck item returned by GET /v1/audit/bottlenecks
 */
export interface BottleneckDto {
  id: number;
  opportunityId: number;
  leadId: number | null;
  leadName: string;
  leadEmail: string;
  stageName: string;
  stageId: number | null;
  weaknessType: string;
  description: string | null;
  hoursStagnant: number;
  value: number | null;
  detectedAt: string;
}

/**
 * Conversion latency per stage returned by GET /v1/audit/conversion-latency
 */
export interface ConversionLatencyDto {
  stageId: number;
  stageName: string;
  orderPosition: number;
  avgHours: number;
  maxHours: number;
  minHours: number;
  totalOpportunities: number;
  totalStagnant: number;
  totalValueAtRisk: number;
}

/**
 * AuditService — provides analytics queries for bottleneck detection and conversion latency.
 * Uses raw SQL with CTEs for performance (target: P95 < 300ms).
 */
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * GET /v1/audit/bottlenecks — returns all detected stagnation alerts with lead/stage details.
   */
  async getBottlenecks(tenantId: number): Promise<BottleneckDto[]> {
    const results = await this.auditLogRepository.query(
      `
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
      `,
      [tenantId],
    );

    return results;
  }

  /**
   * GET /v1/audit/conversion-latency — returns average time per stage with risk indicators.
   * Uses a CTE to calculate conversion latency across all pipeline stages.
   */
  async getConversionLatency(
    tenantId: number,
  ): Promise<ConversionLatencyDto[]> {
    const results = await this.auditLogRepository.query(
      `
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
      `,
      [tenantId],
    );

    return results;
  }
}
