import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignsRepository: Repository<Campaign>,
  ) {}

  async findByTenant(tenantId: number): Promise<Campaign[]> {
    return this.campaignsRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }
}
