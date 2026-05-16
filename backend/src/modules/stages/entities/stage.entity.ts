import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

/**
 * Stage entity — represents a step in the sales pipeline.
 * sla_max_hours defines the stagnation threshold for this stage.
 */
@Entity('stages')
export class Stage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'tenant_id', type: 'int' })
  tenantId!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'order_position', type: 'int' })
  orderPosition!: number;

  @Column({ name: 'probability_percent', type: 'int', default: 0 })
  probabilityPercent!: number;

  /**
   * Maximum hours a lead can stay in this stage before being flagged as stagnant.
   * Default: 48 hours (as per RF01 specification).
   */
  @Column({ name: 'sla_max_hours', type: 'int', default: 48 })
  slaMaxHours!: number;
}
