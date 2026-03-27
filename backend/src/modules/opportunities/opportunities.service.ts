import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from './entities/opportunity.entity';

<<<<<<< HEAD
=======
/**
 * OpportunitiesService — stub for Step 01.
 * PATCH /v1/deals/{id}/status and stagnation worker logic in Step 05 & 08.
 */
>>>>>>> origin/copilot/read-project-documents
@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunitiesRepository: Repository<Opportunity>,
  ) {}
}
