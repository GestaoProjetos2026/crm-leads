import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Opportunity } from '../opportunities/entities/opportunity.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { Stage } from '../stages/entities/stage.entity';
import { LeadStagnatedEvent } from './events/lead-stagnated.event';

/**
 * StagnationWorker — runs every 10 minutes to detect leads stuck in a pipeline stage
 * beyond the configured SLA threshold (default: 48h).
 *
 * Implements idempotency: will NOT create duplicate audit_log entries for the same
 * opportunity + stage + weakness_type combination.
 *
 * Emits a `lead.stagnated` event for each new stagnation alert, enabling
 * downstream automations (notifications, webhooks, reassignment, etc.).
 */
@Injectable()
export class StagnationWorker {
  private readonly logger = new Logger(StagnationWorker.name);

  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,

    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,

    @InjectRepository(Stage)
    private readonly stageRepo: Repository<Stage>,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Scan for stagnant leads every 10 minutes.
   * Query: Find all OPEN opportunities where (NOW() - updated_at) exceeds the
   * stage's sla_max_hours threshold.
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async scanStagnantLeads(): Promise<void> {
    this.logger.log('🔍 Stagnation scan started...');

    try {
      // Raw query for performance: join opportunities with stages and filter by SLA
      const stagnantOpportunities: Array<{
        opportunity_id: number;
        tenant_id: number;
        lead_id: number;
        stage_id: number;
        stage_name: string;
        value: number | null;
        hours_stagnant: number;
        sla_max_hours: number;
      }> = await this.opportunityRepo.query(`
        SELECT
          o.id AS opportunity_id,
          o.tenant_id,
          o.lead_id,
          o.stage_id,
          s.name AS stage_name,
          o.value,
          (julianday('now') - julianday(o.updated_at)) * 24 AS hours_stagnant,
          s.sla_max_hours
        FROM opportunities o
        JOIN stages s ON o.stage_id = s.id AND o.tenant_id = s.tenant_id
        WHERE o.status = 'Open'
          AND (julianday('now') - julianday(o.updated_at)) * 24 > s.sla_max_hours
        ORDER BY hours_stagnant DESC
      `);

      this.logger.log(
        `Found ${stagnantOpportunities.length} stagnant opportunities`,
      );

      let newAlerts = 0;

      for (const opp of stagnantOpportunities) {
        // IDEMPOTENCY CHECK: Don't create duplicate alerts for same opportunity+stage
        const existingAlert = await this.auditLogRepo.findOne({
          where: {
            opportunityId: opp.opportunity_id,
            stageId: opp.stage_id,
            weaknessType: 'Stagnation',
          },
        });

        if (existingAlert) {
          continue; // Already notified — skip
        }

        // Create new audit log entry
        const hoursStagnant = Math.round(opp.hours_stagnant);
        const auditLog = this.auditLogRepo.create({
          tenantId: opp.tenant_id,
          opportunityId: opp.opportunity_id,
          leadId: opp.lead_id,
          stageId: opp.stage_id,
          weaknessType: 'Stagnation',
          description:
            `Lead parado há ${hoursStagnant}h na etapa "${opp.stage_name}" ` +
            `(SLA: ${opp.sla_max_hours}h). ` +
            (opp.value
              ? `Valor em risco: R$ ${Number(opp.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : 'Sem valor estimado'),
        });

        await this.auditLogRepo.save(auditLog);
        newAlerts++;

        // Emit event for downstream automations
        const detectedAt = new Date();
        this.eventEmitter.emit(
          LeadStagnatedEvent.EVENT_NAME,
          new LeadStagnatedEvent(
            opp.tenant_id,
            opp.opportunity_id,
            opp.lead_id,
            opp.stage_id,
            opp.stage_name,
            hoursStagnant,
            opp.sla_max_hours,
            opp.value,
            detectedAt,
          ),
        );

        this.logger.debug(
          `Emitted ${LeadStagnatedEvent.EVENT_NAME} for Opportunity #${opp.opportunity_id}`,
        );
      }

      this.logger.log(
        `✅ Stagnation scan complete. ${newAlerts} new alerts created.`,
      );
    } catch (error) {
      this.logger.error('❌ Stagnation scan failed', (error as Error).stack);
    }
  }
}
