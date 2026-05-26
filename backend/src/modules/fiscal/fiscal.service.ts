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

/**
 * FiscalService — orchestrates the lead-to-Fiscal conversion flow.
 *
 * 1. Fetches the lead + opportunity from the local DB
 * 2. Builds the conversion payload
 * 3. POSTs to the Finance-Fiscal API (Squad 2) using Basic Auth
 * 4. Returns a standardised response to the controller
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
      'http://finance-fiscal-svc.default.svc.cluster.local:8080',
    );
    this.apiUser = this.configService.get<string>('fiscal.apiUser', 'admin');
    this.apiPassword = this.configService.get<string>(
      'fiscal.apiPassword',
      'admin123',
    );
    this.timeoutMs = this.configService.get<number>('fiscal.timeoutMs', 5000);
  }

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
}
