import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('campaigns')
@ApiBearerAuth()
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  @ApiOperation({ summary: 'List all campaigns for the tenant' })
  async findAll(@TenantId() tenantId: number) {
    return this.campaignsService.findByTenant(tenantId);
  }
}
