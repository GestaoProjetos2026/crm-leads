import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

/**
 * TenantsService — stub for Step 01.
 * Provisioning and feature-flag logic to be added in Step 02+.
 */
@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantsRepository: Repository<Tenant>,
  ) {}

  /**
   * Cria um novo tenant.
   */
  async create(data: {
    name: string;
    plan?: string;
  }): Promise<Tenant> {
    const tenant = this.tenantsRepository.create({
      name: data.name,
      plan: data.plan || 'starter',
      isBlocked: false,
    });
    return this.tenantsRepository.save(tenant);
  }

  /**
   * Busca um tenant pelo ID.
   */
  async findById(id: number): Promise<Tenant | null> {
    return this.tenantsRepository.findOne({ where: { id } });
  }

  /**
   * Lista todos os tenants.
   */
  async findAll(): Promise<Tenant[]> {
    return this.tenantsRepository.find();
  }
}
