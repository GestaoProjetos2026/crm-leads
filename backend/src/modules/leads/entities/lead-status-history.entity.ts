import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from './tenant.entity';
import { Lead } from './lead.entity';

@Entity('lead_status_history')
export class LeadStatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tenant_id: number;

  @Column()
  lead_id: number;

  @Column({ length: 50, nullable: true })
  old_status: string;

  @Column({ length: 50 })
  new_status: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Lead)
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;
}