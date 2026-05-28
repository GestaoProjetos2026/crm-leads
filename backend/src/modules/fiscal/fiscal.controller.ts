import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { FiscalService } from './fiscal.service';
import { ConvertLeadToFiscalDto } from './dto/convert-lead-to-fiscal.dto';
import { FiscalConversionResponseDto } from './dto/fiscal-conversion-response.dto';
import { InvoiceIntentDto } from './dto/invoice-intent.dto';
import { InvoiceConfirmDto } from './dto/invoice-confirm.dto';
import { InvoiceProxyResponseDto } from './dto/invoice-response.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';

/**
 * FiscalController — exposes the lead-to-Fiscal conversion endpoint
 * and invoice proxy endpoints for the Fiscal API (Squad 2).
 *
 * Lead conversion:
 *   POST /v1/fiscal/leads/:leadId/convert
 *
 * Invoice operations:
 *   POST /v1/fiscal/invoice/intent    — preview/calculate
 *   POST /v1/fiscal/invoice/confirm   — emit invoice (atomic)
 *   GET  /v1/fiscal/invoice/:numero   — fetch existing invoice
 */
@ApiTags('fiscal')
@ApiBearerAuth()
@Controller('fiscal')
export class FiscalController {
  constructor(private readonly fiscalService: FiscalService) {}

  // ═══════════════════════════════════════════════════════════════════
  //  Lead → Fiscal conversion
  // ═══════════════════════════════════════════════════════════════════

  /**
   * POST /v1/fiscal/leads/:leadId/convert
   *
   * Triggers lead conversion to the Fiscal system (Squad 2).
   * Fetches lead + opportunity from the DB, builds the payload,
   * and POSTs to the Finance-Fiscal API.
   */
  @Post('leads/:leadId/convert')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Converter lead para o sistema Fiscal (Squad 2)',
    description:
      'Dispara a conversão de um lead do CRM para o módulo Finance-Fiscal. ' +
      'Os dados do lead e da oportunidade são enviados automaticamente. ' +
      'Opcionalmente, é possível especificar uma oportunidade específica e adicionar notas.',
  })
  @ApiParam({
    name: 'leadId',
    type: Number,
    description: 'ID do lead a ser convertido',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Conversão disparada com sucesso',
    type: FiscalConversionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Lead ou oportunidade não encontrada',
  })
  @ApiResponse({
    status: 408,
    description: 'Timeout na comunicação com a API do Fiscal',
  })
  @ApiResponse({
    status: 502,
    description: 'Falha na comunicação com a API do Fiscal',
  })
  async convertToFiscal(
    @TenantId() tenantId: number,
    @Param('leadId', ParseIntPipe) leadId: number,
    @Body() dto: ConvertLeadToFiscalDto,
  ): Promise<FiscalConversionResponseDto> {
    return this.fiscalService.convertLeadToFiscal(tenantId, leadId, dto);
  }

  // ═══════════════════════════════════════════════════════════════════
  //  Invoice proxy — intent / confirm / get
  // ═══════════════════════════════════════════════════════════════════

  /**
   * POST /v1/fiscal/invoice/intent
   *
   * Calcula os valores de uma nota fiscal sem salvar no banco.
   * Útil para pré-visualização antes da confirmação.
   */
  @Post('invoice/intent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Pré-visualizar nota fiscal (sem salvar)',
    description:
      'Envia itens (SKU + quantidade) para a API do Fiscal, que calcula ' +
      'preço unitário, impostos e totais sem persistir nada. ' +
      'Use para telas de confirmação antes de emitir a NF.',
  })
  @ApiResponse({
    status: 200,
    description: 'Intenção calculada com sucesso',
    type: InvoiceProxyResponseDto,
  })
  @ApiResponse({
    status: 408,
    description: 'Timeout na comunicação com a API do Fiscal',
  })
  @ApiResponse({
    status: 502,
    description: 'Falha na comunicação com a API do Fiscal',
  })
  async invoiceIntent(
    @TenantId() tenantId: number,
    @Body() dto: InvoiceIntentDto,
  ): Promise<InvoiceProxyResponseDto> {
    return this.fiscalService.invoiceIntent(tenantId, dto);
  }

  /**
   * POST /v1/fiscal/invoice/confirm
   *
   * Confirma a emissão da nota fiscal.
   * Operação atômica: valida estoque → baixa estoque → salva NF → registra entrada no caixa.
   */
  @Post('invoice/confirm')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Confirmar emissão de nota fiscal',
    description:
      'Emite a nota fiscal na API do Fiscal. Operação atômica que ' +
      'valida estoque, baixa estoque, salva a nota e registra entrada no caixa.',
  })
  @ApiResponse({
    status: 201,
    description: 'Nota fiscal emitida com sucesso',
    type: InvoiceProxyResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Número de nota fiscal já existe',
  })
  @ApiResponse({
    status: 422,
    description: 'Estoque insuficiente para algum SKU',
  })
  @ApiResponse({
    status: 408,
    description: 'Timeout na comunicação com a API do Fiscal',
  })
  @ApiResponse({
    status: 502,
    description: 'Falha na comunicação com a API do Fiscal',
  })
  async invoiceConfirm(
    @TenantId() tenantId: number,
    @Body() dto: InvoiceConfirmDto,
  ): Promise<InvoiceProxyResponseDto> {
    return this.fiscalService.invoiceConfirm(tenantId, dto);
  }

  /**
   * GET /v1/fiscal/invoice/:numero
   *
   * Busca uma nota fiscal emitida com todos os seus itens e totais.
   */
  @Get('invoice/:numero')
  @ApiOperation({
    summary: 'Buscar nota fiscal por número',
    description:
      'Consulta uma nota fiscal emitida na API do Fiscal pelo seu número. ' +
      'Retorna os dados da nota, itens detalhados e totais.',
  })
  @ApiParam({
    name: 'numero',
    type: String,
    description: 'Número da nota fiscal (ex: NF-2026-001)',
    example: 'NF-2026-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Nota fiscal encontrada',
    type: InvoiceProxyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Nota fiscal não encontrada',
  })
  @ApiResponse({
    status: 408,
    description: 'Timeout na comunicação com a API do Fiscal',
  })
  @ApiResponse({
    status: 502,
    description: 'Falha na comunicação com a API do Fiscal',
  })
  async getInvoice(
    @TenantId() tenantId: number,
    @Param('numero') numero: string,
  ): Promise<InvoiceProxyResponseDto> {
    return this.fiscalService.getInvoice(tenantId, numero);
  }
}
