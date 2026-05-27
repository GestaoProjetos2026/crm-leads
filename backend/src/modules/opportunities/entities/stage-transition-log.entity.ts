import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Opportunity } from './opportunity.entity';
import { Stage } from '../../stages/entities/stage.entity';

/**
 * StageTransitionLog — append-only record of every stage movement
 * for an opportunity in the pipeline.
 *
 * Used by the conversion-latency analytics to calculate real time
 * spent in each stage using LEAD() OVER window functions.
 *
 * from_stage_id is NULL for the initial placement (lead ingest).
 */
@Entity('stage_transition_logs')
export class StageTransitionLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'tenant_id', type: 'int' })
  tenantId!: number;

  @Column({ name: 'opportunity_id', type: 'int' })
  opportunityId!: number;

  /** NULL when this is the initial placement from lead ingest */
  @Column({ name: 'from_stage_id', type: 'int', nullable: true })
  fromStageId!: number | null;

  @Column({ name: 'to_stage_id', type: 'int' })
  toStageId!: number;

  @CreateDateColumn({ name: 'transitioned_at', type: 'text' })
  transitionedAt!: Date;

  /* ── Relations ── */

  @ManyToOne(() => Opportunity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'opportunity_id' })
  opportunity!: Opportunity;

  @ManyToOne(() => Stage, { nullable: true })
  @JoinColumn({ name: 'from_stage_id' })
  fromStage!: Stage | null;

  @ManyToOne(() => Stage)
  @JoinColumn({ name: 'to_stage_id' })
  toStage!: Stage;
}
