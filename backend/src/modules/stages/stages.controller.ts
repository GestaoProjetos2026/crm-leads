import { Controller, Get, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StagesService } from './stages.service';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('config')
@ApiBearerAuth()
@Controller('config/stages')
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Get()
  @ApiOperation({ summary: 'List all pipeline stages for the tenant' })
  @ApiResponse({ status: 200, description: 'List of stages' })
  async findAll(@TenantId() tenantId: number) {
    return this.stagesService.findByTenant(tenantId);
  }

  @Patch(':id/sla')
  @ApiOperation({ summary: 'Update SLA threshold for a pipeline stage' })
  @ApiResponse({ status: 200, description: 'SLA updated successfully' })
  async updateSla(
    @TenantId() tenantId: number,
    @Param('id', ParseIntPipe) stageId: number,
    @Body('slaMaxHours', ParseIntPipe) slaMaxHours: number,
  ) {
    return this.stagesService.updateSla(tenantId, stageId, slaMaxHours);
  }
}
