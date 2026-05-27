import {
  Controller,
  Post,
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
import { TenantId } from '../../common/decorators/tenant.decorator';

/**
 * FiscalController — exposes the lead-to-Fiscal conversion endpoint.
 *
 * POST /v1/fiscal/leads/:leadId/convert
 *
 * Dispatches lead + opportunity data to the Finance-Fiscal API (Squad 2)
 * for invoice / contract creation on the fiscal side.
 */
@ApiTags('fiscal')
@ApiBearerAuth()
@Controller('fiscal')
export class FiscalController {
  constructor(private readonly fiscalService: FiscalService) {}

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
}
