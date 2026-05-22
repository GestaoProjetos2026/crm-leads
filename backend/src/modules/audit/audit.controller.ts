import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { TenantId } from '../../common/decorators/tenant.decorator';

/**
 * AuditController — exposes bottleneck and conversion-latency analytics.
 */
@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('bottlenecks')
  @ApiOperation({
    summary: 'List all detected bottlenecks (stagnant leads)',
    description:
      'Returns leads that have been stuck in a pipeline stage beyond the configured SLA threshold.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of bottlenecks with lead and stage details',
  })
  async getBottlenecks(@TenantId() tenantId: number) {
    return this.auditService.getBottlenecks(tenantId);
  }

  @Get('conversion-latency')
  @ApiOperation({
    summary: 'Get conversion latency per pipeline stage',
    description:
      'Returns average, max, and min time per stage plus value-at-risk for stagnant opportunities.',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversion latency metrics per stage',
  })
  async getConversionLatency(@TenantId() tenantId: number) {
    return this.auditService.getConversionLatency(tenantId);
  }
}
