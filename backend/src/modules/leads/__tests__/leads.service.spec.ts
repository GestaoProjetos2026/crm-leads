import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LeadsService } from '../leads.service';
import { Lead } from '../entities/lead.entity';
import { Opportunity } from '../../opportunities/entities/opportunity.entity';
import { Stage } from '../../stages/entities/stage.entity';
import { StageTransitionLog } from '../../opportunities/entities/stage-transition-log.entity';

describe('LeadsService', () => {
  let service: LeadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: getRepositoryToken(Lead),
          useValue: {}, // mock repository
        },
        {
          provide: getRepositoryToken(Opportunity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Stage),
          useValue: {},
        },
        {
          provide: getRepositoryToken(StageTransitionLog),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
