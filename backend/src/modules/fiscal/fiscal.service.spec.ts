import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadGatewayException, RequestTimeoutException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosError, AxiosHeaders } from 'axios';

import { FiscalService } from './fiscal.service';
import { Lead } from '../leads/entities/lead.entity';
import { Opportunity } from '../opportunities/entities/opportunity.entity';

describe('FiscalService', () => {
  let service: FiscalService;
  let httpService: HttpService;
  let leadRepo: Record<string, jest.Mock>;
  let opportunityRepo: Record<string, jest.Mock>;

  const mockLead: Partial<Lead> = {
    id: 1,
    tenantId: 10,
    firstName: 'João',
    lastName: 'Silva',
    email: 'joao@empresa.com',
    source: 'facebook_leads',
    campaignId: 42,
    campaign: null,
  };

  const mockOpportunity: Partial<Opportunity> = {
    id: 100,
    tenantId: 10,
    leadId: 1,
    stageId: 3,
    value: 15000,
    status: 'Won',
    expectedCloseDate: new Date('2026-06-01'),
    stage: { id: 3, tenantId: 10, name: 'Fechamento', orderPosition: 4, probabilityPercent: 90, slaMaxHours: 48 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    leadRepo = {
      findOne: jest.fn(),
    };

    opportunityRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FiscalService,
        {
          provide: HttpService,
          useValue: { post: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: unknown) => {
              const config: Record<string, unknown> = {
                'fiscal.baseUrl': 'http://fiscal-test:8080',
                'fiscal.apiUser': 'admin',
                'fiscal.apiPassword': 'admin123',
                'fiscal.timeoutMs': 5000,
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
        {
          provide: getRepositoryToken(Lead),
          useValue: leadRepo,
        },
        {
          provide: getRepositoryToken(Opportunity),
          useValue: opportunityRepo,
        },
      ],
    }).compile();

    service = module.get<FiscalService>(FiscalService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── Success ────────────────────────────────────────────────────────
  describe('convertLeadToFiscal — success', () => {
    it('should convert a lead successfully', async () => {
      leadRepo.findOne.mockResolvedValue(mockLead);
      opportunityRepo.findOne.mockResolvedValue(mockOpportunity);

      const axiosResponse: AxiosResponse = {
        data: { referenceId: 'FISCAL-2026-00042' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      (httpService.post as jest.Mock).mockReturnValue(of(axiosResponse));

      const result = await service.convertLeadToFiscal(10, 1, {});

      expect(result.success).toBe(true);
      expect(result.leadId).toBe(1);
      expect(result.fiscalReferenceId).toBe('FISCAL-2026-00042');
      expect(result.message).toContain('sucesso');
      expect(httpService.post).toHaveBeenCalledWith(
        'http://fiscal-test:8080/v1/conversions',
        expect.objectContaining({
          tenantId: 10,
          lead: expect.objectContaining({ id: 1, email: 'joao@empresa.com' }),
          opportunity: expect.objectContaining({ id: 100 }),
        }),
        expect.objectContaining({
          auth: { username: 'admin', password: 'admin123' },
        }),
      );
    });
  });

  // ── Lead not found ─────────────────────────────────────────────────
  describe('convertLeadToFiscal — lead not found', () => {
    it('should throw NotFoundException when lead does not exist', async () => {
      leadRepo.findOne.mockResolvedValue(null);

      await expect(
        service.convertLeadToFiscal(10, 999, {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── Opportunity not found ──────────────────────────────────────────
  describe('convertLeadToFiscal — opportunity not found', () => {
    it('should throw NotFoundException when no opportunity exists', async () => {
      leadRepo.findOne.mockResolvedValue(mockLead);
      opportunityRepo.findOne.mockResolvedValue(null);

      await expect(
        service.convertLeadToFiscal(10, 1, {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── Fiscal API error (4xx) ─────────────────────────────────────────
  describe('convertLeadToFiscal — Fiscal API client error', () => {
    it('should throw BadGatewayException on 4xx response', async () => {
      leadRepo.findOne.mockResolvedValue(mockLead);
      opportunityRepo.findOne.mockResolvedValue(mockOpportunity);

      const axiosError = new AxiosError(
        'Request failed with status code 422',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 422,
          statusText: 'Unprocessable Entity',
          data: { message: 'Dados inválidos' },
          headers: {},
          config: { headers: new AxiosHeaders() },
        },
      );

      (httpService.post as jest.Mock).mockReturnValue(throwError(() => axiosError));

      await expect(
        service.convertLeadToFiscal(10, 1, {}),
      ).rejects.toThrow(BadGatewayException);
    });
  });

  // ── Fiscal API timeout ─────────────────────────────────────────────
  describe('convertLeadToFiscal — timeout', () => {
    it('should throw RequestTimeoutException on timeout', async () => {
      leadRepo.findOne.mockResolvedValue(mockLead);
      opportunityRepo.findOne.mockResolvedValue(mockOpportunity);

      const axiosError = new AxiosError(
        'timeout of 5000ms exceeded',
        'ECONNABORTED',
      );

      (httpService.post as jest.Mock).mockReturnValue(throwError(() => axiosError));

      await expect(
        service.convertLeadToFiscal(10, 1, {}),
      ).rejects.toThrow(RequestTimeoutException);
    });
  });

  // ── With specific opportunityId ────────────────────────────────────
  describe('convertLeadToFiscal — with opportunityId', () => {
    it('should query by specific opportunityId when provided', async () => {
      leadRepo.findOne.mockResolvedValue(mockLead);
      opportunityRepo.findOne.mockResolvedValue(mockOpportunity);

      const axiosResponse: AxiosResponse = {
        data: { referenceId: 'FISCAL-2026-00043' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      (httpService.post as jest.Mock).mockReturnValue(of(axiosResponse));

      await service.convertLeadToFiscal(10, 1, { opportunityId: 100 });

      expect(opportunityRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 100 }),
        }),
      );
    });
  });
});
