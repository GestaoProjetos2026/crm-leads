import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Opportunity } from '../../opportunities/entities/opportunity.entity';

/**
 * AuditLog entity — append-only record of detected weaknesses.
 * PostgreSQL RLS policy allows INSERT only — no UPDATE or DELETE.
 *
 * lead_id and stage_id are used for idempotency checks by the StagnationWorker:
 * it won't create a duplicate if (opportunity_id, stage_id, weakness_type) already exists.
 */
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'tenant_id', type: 'int' })
  tenantId!: number;

  @Column({ name: 'opportunity_id', type: 'int' })
  opportunityId!: number;

  /** Lead associated with this bottleneck — denormalized for query performance */
  @Column({ name: 'lead_id', type: 'int', nullable: true })
  leadId!: number | null;

  /** Stage where the bottleneck was detected — used for idempotency */
  @Column({ name: 'stage_id', type: 'int', nullable: true })
  stageId!: number | null;

  /**
   * Weakness classification: Stagnation | Low_Conversion
   * Maps to audit_logs.weakness_type in the architecture spec.
   */
  @Column({ name: 'weakness_type', type: 'varchar', length: 50 })
  weaknessType!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  /** Immutable — set on creation, never updated */
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  /* ── Relations ── */

  @ManyToOne(() => Opportunity)
  @JoinColumn({ name: 'opportunity_id' })
  opportunity!: Opportunity;
}
