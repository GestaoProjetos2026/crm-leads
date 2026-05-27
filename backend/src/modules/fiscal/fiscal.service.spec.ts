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
          useValue: { post: jest.fn(), get: jest.fn() },
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

  // ═══════════════════════════════════════════════════════════════════
  //  convertLeadToFiscal
  // ═══════════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════════
  //  invoiceIntent
  // ═══════════════════════════════════════════════════════════════════

  describe('invoiceIntent — success', () => {
    it('should return calculated invoice preview', async () => {
      const fiscalResponse = {
        status: 'success',
        data: {
          itens: [{ sku: 'PROD-001', nome: 'Caneta Azul', quantidade: 2, preco_unitario: 2.50, aliquota: 0.12, valor_bruto: 5.00, valor_imposto: 0.60, valor_total: 5.60 }],
          skus_invalidos: [],
          totais: { total_bruto: 5.00, total_imposto: 0.60, total_final: 5.60 },
        },
        message: 'Intenção calculada. Use /invoice/confirm para confirmar.',
      };

      const axiosResponse: AxiosResponse = {
        data: fiscalResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      (httpService.post as jest.Mock).mockReturnValue(of(axiosResponse));

      const result = await service.invoiceIntent(10, {
        itens: [{ sku: 'PROD-001', quantidade: 2 }],
      });

      expect(result.status).toBe('success');
      expect(result.data).toBeDefined();
      expect(httpService.post).toHaveBeenCalledWith(
        'http://fiscal-test:8080/v1/fisc/invoice/intent',
        { itens: [{ sku: 'PROD-001', quantidade: 2 }] },
        expect.objectContaining({
          auth: { username: 'admin', password: 'admin123' },
          headers: expect.objectContaining({ 'X-Tenant-Id': '10' }),
        }),
      );
    });
  });

  describe('invoiceIntent — timeout', () => {
    it('should throw RequestTimeoutException on timeout', async () => {
      const axiosError = new AxiosError(
        'timeout of 5000ms exceeded',
        'ECONNABORTED',
      );
      (httpService.post as jest.Mock).mockReturnValue(throwError(() => axiosError));

      await expect(
        service.invoiceIntent(10, { itens: [{ sku: 'PROD-001', quantidade: 1 }] }),
      ).rejects.toThrow(RequestTimeoutException);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  //  invoiceConfirm
  // ═══════════════════════════════════════════════════════════════════

  describe('invoiceConfirm — success', () => {
    it('should emit invoice successfully', async () => {
      const fiscalResponse = {
        status: 'success',
        data: {
          nota: { id: 1, numero_nota: 'NF-2026-001', status: 'emitida', data_criacao: '2026-05-27' },
          itens: [],
          totais: { total_final: 5.60, num_itens: 1 },
        },
        message: 'Nota emitida com sucesso.',
      };

      const axiosResponse: AxiosResponse = {
        data: fiscalResponse,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      (httpService.post as jest.Mock).mockReturnValue(of(axiosResponse));

      const result = await service.invoiceConfirm(10, {
        numero: 'NF-2026-001',
        descricao: 'Venda loja',
        itens: [{ sku: 'PROD-001', quantidade: 2 }],
      });

      expect(result.status).toBe('success');
      expect(httpService.post).toHaveBeenCalledWith(
        'http://fiscal-test:8080/v1/fisc/invoice/confirm',
        expect.objectContaining({ numero: 'NF-2026-001' }),
        expect.objectContaining({
          auth: { username: 'admin', password: 'admin123' },
        }),
      );
    });
  });

  describe('invoiceConfirm — duplicate invoice number (409)', () => {
    it('should throw BadGatewayException on 409 response', async () => {
      const axiosError = new AxiosError(
        'Request failed with status code 409',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 409,
          statusText: 'Conflict',
          data: { status: 'error', message: 'Número de nota já existe.' },
          headers: {},
          config: { headers: new AxiosHeaders() },
        },
      );
      (httpService.post as jest.Mock).mockReturnValue(throwError(() => axiosError));

      await expect(
        service.invoiceConfirm(10, {
          numero: 'NF-2026-001',
          itens: [{ sku: 'PROD-001', quantidade: 2 }],
        }),
      ).rejects.toThrow(BadGatewayException);
    });
  });

  describe('invoiceConfirm — insufficient stock (422)', () => {
    it('should throw BadGatewayException on 422 response', async () => {
      const axiosError = new AxiosError(
        'Request failed with status code 422',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 422,
          statusText: 'Unprocessable Entity',
          data: { status: 'error', message: 'Estoque insuficiente para PROD-001.' },
          headers: {},
          config: { headers: new AxiosHeaders() },
        },
      );
      (httpService.post as jest.Mock).mockReturnValue(throwError(() => axiosError));

      await expect(
        service.invoiceConfirm(10, {
          numero: 'NF-2026-002',
          itens: [{ sku: 'PROD-001', quantidade: 999 }],
        }),
      ).rejects.toThrow(BadGatewayException);
    });
  });

  describe('invoiceConfirm — timeout', () => {
    it('should throw RequestTimeoutException on timeout', async () => {
      const axiosError = new AxiosError(
        'timeout of 5000ms exceeded',
        'ECONNABORTED',
      );
      (httpService.post as jest.Mock).mockReturnValue(throwError(() => axiosError));

      await expect(
        service.invoiceConfirm(10, {
          numero: 'NF-2026-003',
          itens: [{ sku: 'PROD-001', quantidade: 1 }],
        }),
      ).rejects.toThrow(RequestTimeoutException);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  //  getInvoice
  // ═══════════════════════════════════════════════════════════════════

  describe('getInvoice — success', () => {
    it('should return the invoice data', async () => {
      const fiscalResponse = {
        status: 'success',
        data: {
          nota: { id: 1, numero_nota: 'NF-2026-001', status: 'emitida', data_criacao: '2026-05-27' },
          itens: [{ sku: 'PROD-001', nome: 'Caneta Azul', quantidade: 2, valor_total: 5.60 }],
          totais: { total_final: 5.60, num_itens: 1 },
        },
        message: 'Nota encontrada.',
      };

      const axiosResponse: AxiosResponse = {
        data: fiscalResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      (httpService.get as jest.Mock).mockReturnValue(of(axiosResponse));

      const result = await service.getInvoice(10, 'NF-2026-001');

      expect(result.status).toBe('success');
      expect(result.message).toBe('Nota encontrada.');
      expect(httpService.get).toHaveBeenCalledWith(
        'http://fiscal-test:8080/v1/fisc/invoice/NF-2026-001',
        expect.objectContaining({
          auth: { username: 'admin', password: 'admin123' },
          headers: expect.objectContaining({ 'X-Tenant-Id': '10' }),
        }),
      );
    });
  });

  describe('getInvoice — not found (404)', () => {
    it('should throw NotFoundException when invoice does not exist', async () => {
      const axiosError = new AxiosError(
        'Request failed with status code 404',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 404,
          statusText: 'Not Found',
          data: { status: 'error', message: 'Nota não encontrada.' },
          headers: {},
          config: { headers: new AxiosHeaders() },
        },
      );
      (httpService.get as jest.Mock).mockReturnValue(throwError(() => axiosError));

      await expect(
        service.getInvoice(10, 'NF-INEXISTENTE'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getInvoice — timeout', () => {
    it('should throw RequestTimeoutException on timeout', async () => {
      const axiosError = new AxiosError(
        'timeout of 5000ms exceeded',
        'ETIMEDOUT',
      );
      (httpService.get as jest.Mock).mockReturnValue(throwError(() => axiosError));

      await expect(
        service.getInvoice(10, 'NF-2026-001'),
      ).rejects.toThrow(RequestTimeoutException);
    });
  });
});
