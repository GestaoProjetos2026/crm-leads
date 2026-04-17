import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

/**
 * User entity — represents authenticated users in the system.
 * Each user belongs to a tenant for multi-tenancy isolation.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'tenant_id', type: 'int' })
  tenantId!: number;

  @Column({ length: 255, unique: true, type: 'varchar' })
  email!: string;

  @Column({ name: 'password_hash', length: 255, type: 'varchar' })
  passwordHash!: string;

  /** User profile: director | marketing_manager | sales_rep */
  @Column({ default: 'sales_rep', type: 'varchar' })
  profile!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;
}