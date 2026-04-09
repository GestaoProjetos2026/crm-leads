import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * Tenant entity — represents a SaaS customer account.
 * All other entities have a tenant_id FK referencing this.
 */
@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255, type: 'varchar' })
  name!: string;

  /** Subscription plan: free | starter | professional | enterprise */
  @Column({ default: 'starter', type: 'varchar' })
  plan!: string;

  @CreateDateColumn({ name: 'created_at', type: 'date' })
  createdAt!: Date;
}
