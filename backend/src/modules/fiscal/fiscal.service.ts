import {
  Injectable,
  Logger,
  NotFoundException,
  BadGatewayException,
  RequestTimeoutException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import { Lead } from '../leads/entities/lead.entity';
import { Opportunity } from '../opportunities/entities/opportunity.entity';
import { ConvertLeadToFiscalDto } from './dto/convert-lead-to-fiscal.dto';
import { FiscalConversionResponseDto } from './dto/fiscal-conversion-response.dto';
import { InvoiceIntentDto } from './dto/invoice-intent.dto';
import { InvoiceConfirmDto } from './dto/invoice-confirm.dto';
import { InvoiceProxyResponseDto } from './dto/invoice-response.dto';

/**
 * FiscalService — orchestrates the lead-to-Fiscal conversion flow.
 *
 * 1. Fetches the lead + opportunity from the local DB
 * 2. Builds the conversion payload
 * 3. POSTs to the Finance-Fiscal API (Squad 2) using Basic Auth
 * 4. Returns a standardised response to the controller
 *
 * Also provides invoice proxy methods (intent / confirm / get) that
 * forward requests to the Fiscal API's /v1/fisc/invoice/* endpoints.
 *
 * Communication uses Kubernetes internal DNS:
 *   http://finance-fiscal-svc.default.svc.cluster.local:<port>
 */
@Injectable()
export class FiscalService {
  private readonly logger = new Logger(FiscalService.name);

  private readonly baseUrl: string;
  private readonly apiUser: string;
  private readonly apiPassword: string;
  private readonly timeoutMs: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,

    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,

    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,
  ) {
    this.baseUrl = this.configService.get<string>(
      'fiscal.baseUrl',
      'https://api.fiscal-finance.40.82.176.176.nip.io',
    );
    this.apiUser = this.configService.get<string>('fiscal.apiUser', 'admin');
    this.apiPassword = this.configService.get<string>(
      'fiscal.apiPassword',
      'admin123',
    );
    this.timeoutMs = this.configService.get<number>('fiscal.timeoutMs', 5000);
  }

  // ═══════════════════════════════════════════════════════════════════
  //  Lead → Fiscal conversion
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Convert a lead to the Fiscal system (Squad 2).
   *
   * @param tenantId  Tenant context extracted from JWT
   * @param leadId    Lead to convert
   * @param dto       Optional extra fields (opportunityId, notes)
   */
  async convertLeadToFiscal(
    tenantId: number,
    leadId: number,
    dto: ConvertLeadToFiscalDto,
  ): Promise<FiscalConversionResponseDto> {
    // ── 1. Fetch the lead ──────────────────────────────────────────────
    const lead = await this.leadRepository.findOne({
      where: { id: leadId, tenantId },
      relations: ['campaign'],
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead #${leadId} não encontrado para o tenant ${tenantId}.`,
      );
    }

    // ── 2. Fetch the opportunity ───────────────────────────────────────
    const opportunityWhere: Record<string, unknown> = {
      tenantId,
      leadId,
    };
    if (dto.opportunityId) {
      opportunityWhere.id = dto.opportunityId;
    }

    const opportunity = await this.opportunityRepository.findOne({
      where: opportunityWhere,
      order: { createdAt: 'DESC' },
      relations: ['stage'],
    });

    if (!opportunity) {
      throw new NotFoundException(
        `Nenhuma oportunidade encontrada para o lead #${leadId} no tenant ${tenantId}.`,
      );
    }

    // ── 3. Build the conversion payload ────────────────────────────────
    const payload = {
      tenantId,
      lead: {
        id: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        source: lead.source,
        campaignId: lead.campaignId,
      },
      opportunity: {
        id: opportunity.id,
        value: opportunity.value,
        status: opportunity.status,
        stageName: opportunity.stage?.name ?? null,
        expectedCloseDate: opportunity.expectedCloseDate,
      },
      notes: dto.notes ?? null,
      convertedAt: new Date().toISOString(),
    };

    this.logger.log(
      `Disparando conversão fiscal: lead=${leadId} opportunity=${opportunity.id} tenant=${tenantId}`,
    );

    // ── 4. POST to the Finance-Fiscal API (Squad 2) ────────────────────
    const url = `${this.baseUrl}/v1/conversions`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          timeout: this.timeoutMs,
          auth: {
            username: this.apiUser,
            password: this.apiPassword,
          },
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Id': String(tenantId),
          },
        }),
      );

      this.logger.log(
        `Conversão fiscal bem-sucedida: lead=${leadId} fiscalRef=${response.data?.referenceId ?? 'N/A'}`,
      );

      return {
        success: true,
        leadId,
        fiscalReferenceId: response.data?.referenceId ?? response.data?.id,
        convertedAt: payload.convertedAt,
        message: 'Conversão enviada com sucesso para o Fiscal.',
      };
    } catch (error) {
      return this.handleFiscalApiError(error, leadId, payload.convertedAt);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  //  Invoice proxy — intent / confirm / get
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Calculate invoice values **without** persisting anything.
   * Proxies to `POST /v1/fisc/invoice/intent` on the Fiscal API.
   *
   * @param tenantId  Tenant context extracted from JWT
   * @param dto       Items to calculate (SKU + quantity)
   */
  async invoiceIntent(
    tenantId: number,
    dto: InvoiceIntentDto,
  ): Promise<InvoiceProxyResponseDto> {
    const url = `${this.baseUrl}/v1/fisc/invoice/intent`;

    this.logger.log(
      `Invoice intent: ${dto.itens.length} item(s) — tenant=${tenantId}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, dto, this.buildRequestConfig(tenantId)),
      );

      return response.data as InvoiceProxyResponseDto;
    } catch (error) {
      return this.handleInvoiceApiError(error, 'intent');
    }
  }

  /**
   * Confirm invoice emission. Atomic operation on the Fiscal API:
   * validates stock → deducts stock → saves invoice → registers cashflow.
   * Proxies to `POST /v1/fisc/invoice/confirm` on the Fiscal API.
   *
   * @param tenantId  Tenant context extracted from JWT
   * @param dto       Invoice number, description and items
   */
  async invoiceConfirm(
    tenantId: number,
    dto: InvoiceConfirmDto,
  ): Promise<InvoiceProxyResponseDto> {
    const url = `${this.baseUrl}/v1/fisc/invoice/confirm`;

    this.logger.log(
      `Invoice confirm: numero=${dto.numero} ${dto.itens.length} item(s) — tenant=${tenantId}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, dto, this.buildRequestConfig(tenantId)),
      );

      this.logger.log(
        `Invoice confirmada com sucesso: numero=${dto.numero} tenant=${tenantId}`,
      );

      return response.data as InvoiceProxyResponseDto;
    } catch (error) {
      return this.handleInvoiceApiError(error, 'confirm');
    }
  }

  /**
   * Fetch an existing invoice by its number.
   * Proxies to `GET /v1/fisc/invoice/<numero>` on the Fiscal API.
   *
   * @param tenantId  Tenant context extracted from JWT
   * @param numero    Invoice number (e.g. "NF-2026-001")
   */
  async getInvoice(
    tenantId: number,
    numero: string,
  ): Promise<InvoiceProxyResponseDto> {
    const url = `${this.baseUrl}/v1/fisc/invoice/${encodeURIComponent(numero)}`;

    this.logger.log(
      `Invoice get: numero=${numero} — tenant=${tenantId}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, this.buildRequestConfig(tenantId)),
      );

      return response.data as InvoiceProxyResponseDto;
    } catch (error) {
      return this.handleInvoiceApiError(error, 'get');
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  //  Private helpers
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Build the shared Axios request config for all Fiscal API calls.
   */
  private buildRequestConfig(tenantId: number) {
    return {
      timeout: this.timeoutMs,
      auth: {
        username: this.apiUser,
        password: this.apiPassword,
      },
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': String(tenantId),
      },
    };
  }

  /**
   * Translate Axios / network errors into meaningful NestJS exceptions.
   */
  private handleFiscalApiError(
    error: unknown,
    leadId: number,
    convertedAt: string,
  ): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const data = error.response?.data;

      this.logger.error(
        `Fiscal API error: status=${status} lead=${leadId} body=${JSON.stringify(data)}`,
      );

      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new RequestTimeoutException(
          `Timeout ao conectar com a API do Fiscal (${this.timeoutMs}ms). Tente novamente.`,
        );
      }

      if (status && status >= 400 && status < 500) {
        // Forward client-level errors from the Fiscal API
        throw new BadGatewayException({
          success: false,
          leadId,
          convertedAt,
          message: `Fiscal API retornou erro ${status}: ${JSON.stringify(data)}`,
        });
      }

      // Server errors (5xx) or connection refused
      throw new BadGatewayException({
        success: false,
        leadId,
        convertedAt,
        message: `Falha na comunicação com a API do Fiscal: ${error.message}`,
      });
    }

    // Unknown / non-Axios error
    this.logger.error('Unexpected error calling Fiscal API', error);
    throw new BadGatewayException({
      success: false,
      leadId,
      convertedAt,
      message: 'Erro inesperado ao comunicar com a API do Fiscal.',
    });
  }

  /**
   * Translate Axios / network errors for invoice proxy endpoints.
   * Similar to handleFiscalApiError but without lead-specific context.
   */
  private handleInvoiceApiError(
    error: unknown,
    operation: string,
  ): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const data = error.response?.data;

      this.logger.error(
        `Fiscal Invoice API error (${operation}): status=${status} body=${JSON.stringify(data)}`,
      );

      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new RequestTimeoutException(
          `Timeout ao conectar com a API do Fiscal (${this.timeoutMs}ms). Tente novamente.`,
        );
      }

      if (status === 404) {
        throw new NotFoundException(
          (data as Record<string, unknown>)?.message ??
            'Recurso não encontrado na API do Fiscal.',
        );
      }

      if (status && status >= 400 && status < 500) {
        throw new BadGatewayException({
          status: 'error',
          data: null,
          message: `Fiscal API retornou erro ${status}: ${JSON.stringify(data)}`,
        });
      }

      throw new BadGatewayException({
        status: 'error',
        data: null,
        message: `Falha na comunicação com a API do Fiscal: ${error.message}`,
      });
    }

    this.logger.error(`Unexpected error in invoice ${operation}`, error);
    throw new BadGatewayException({
      status: 'error',
      data: null,
      message: 'Erro inesperado ao comunicar com a API do Fiscal.',
    });
  }
}
