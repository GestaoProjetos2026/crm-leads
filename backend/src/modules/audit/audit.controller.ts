import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { Public } from '../../common/decorators/public.decorator';

/**
 * AuditController — exposes bottleneck and conversion-latency analytics.
 * Endpoints are marked @Public() for easy demo/presentation access.
 * In production, use @ApiBearerAuth() + JWT protection.
 */
@ApiTags('audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('bottlenecks')
  @Public()
  @ApiOperation({
    summary: 'List all detected bottlenecks (stagnant leads)',
    description:
      'Returns leads that have been stuck in a pipeline stage beyond the configured SLA threshold.',
  })
  @ApiQuery({
    name: 'companyId',
    type: Number,
    required: true,
    description: 'Tenant/company ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of bottlenecks with lead and stage details',
  })
  async getBottlenecks(@Query('companyId', ParseIntPipe) companyId: number) {
    return this.auditService.getBottlenecks(companyId);
  }

  @Get('conversion-latency')
  @Public()
  @ApiOperation({
    summary: 'Get conversion latency per pipeline stage',
    description:
      'Returns average, max, and min time per stage plus value-at-risk for stagnant opportunities.',
  })
  @ApiQuery({
    name: 'companyId',
    type: Number,
    required: true,
    description: 'Tenant/company ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversion latency metrics per stage',
  })
  async getConversionLatency(
    @Query('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.auditService.getConversionLatency(companyId);
  }
}
