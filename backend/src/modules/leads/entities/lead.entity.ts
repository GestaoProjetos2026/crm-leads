import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Campaign } from '../../campaigns/entities/campaign.entity';

/**
 * Lead entity — represents a prospect entering the CRM pipeline.
 * tenant_id is present on every entity for RLS enforcement.
 */
@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'tenant_id', type: 'int' })
  tenantId!: number;

  @Column({ name: 'campaign_id', type: 'int', nullable: true })
  campaignId!: number | null;

  @Column({ name: 'first_name', type: 'varchar', length: 255 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 255 })
  lastName!: string;

  @Column({ length: 255, type: 'varchar' })
  email!: string;

  /** Lead origin channel: facebook_leads, landing_page, etc. (RF required) */
  @Column({ length: 100, type: 'varchar' })
  source!: string;

  /** Soft-delete flag — set to true after 180d without interaction (RF03) */
  @Column({ name: 'is_inactive', type: 'bool', default: false })
  isInactive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  /** Monitored by inactivity Worker for 180d threshold */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  /* ── Relations ── */

  @ManyToOne(() => Campaign, { nullable: true })
  @JoinColumn({ name: 'campaign_id' })
  campaign!: Campaign | null;
}
