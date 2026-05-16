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
 *
 * Conversion latency now uses real stage_transition_logs with LEAD() OVER
 * window functions to calculate actual time spent in each pipeline stage.
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
   * GET /v1/audit/conversion-latency — returns real time spent per stage
   * using stage_transition_logs.
   *
   * Uses LEAD() OVER to find the next transition timestamp for each opportunity,
   * calculating actual hours spent in each stage. For leads still in the current
   * stage (no next log), uses NOW() (if Open) or updated_at (if Won/Lost).
   */
  async getConversionLatency(
    tenantId: number,
  ): Promise<ConversionLatencyDto[]> {
    const results = await this.auditLogRepository.query(
      `
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
      `,
      [tenantId],
    );

    return results;
  }
}
