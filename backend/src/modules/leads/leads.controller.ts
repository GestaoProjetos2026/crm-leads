import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { IngestLeadDto } from './dto/ingest-lead.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import type { Request } from 'express';

/**
 * LeadsController — handles lead ingest and listing.
 */
@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * POST /v1/leads/ingest
   * Public endpoint protected by API Key (x-api-key header).
   * Receives leads from external sources (Facebook Leads, Landing Pages, etc.)
   */
  @Post('ingest')
  @Public()
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Ingest a lead from an external source',
    description:
      'Receives lead data from Facebook Leads, Landing Pages, etc. ' +
      'Requires x-api-key header and tenantId query parameter.',
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authentication',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Lead ingested successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing API key',
  })
  @ApiResponse({
    status: 409,
    description: 'Lead with this email already exists',
  })
  async ingest(@Body() dto: IngestLeadDto, @Req() req: Request) {
    const tenantId = (req as any).tenantId as number;
    return this.leadsService.ingestLead(tenantId, dto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all leads for the authenticated tenant' })
  @ApiResponse({ status: 200, description: 'List of leads' })
  async findAll() {
    return this.leadsService.findByTenant(1);
  }
}
