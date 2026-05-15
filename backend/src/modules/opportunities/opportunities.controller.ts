import {
  Controller,
  Patch,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';
import { TenantId } from '../../common/decorators/tenant.decorator';

/**
 * OpportunitiesController — manages pipeline deal operations.
 * PATCH /v1/deals/:id/stage moves an opportunity between stages
 * and records a transition log for conversion-latency analytics.
 */
@ApiTags('opportunities')
@ApiBearerAuth()
@Controller('deals')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  /**
   * PATCH /v1/deals/:id/stage
   * Move an opportunity to a different pipeline stage.
   * Records a stage_transition_log entry for analytics.
   */
  @Patch(':id/stage')
  @ApiOperation({
    summary: 'Move an opportunity to a new pipeline stage',
    description:
      'Updates the opportunity stage and records a transition log ' +
      'for conversion-latency analytics.',
  })
  @ApiResponse({ status: 200, description: 'Stage updated successfully' })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  async moveStage(
    @TenantId() tenantId: number,
    @Param('id', ParseIntPipe) opportunityId: number,
    @Body('stageId', ParseIntPipe) newStageId: number,
  ) {
    return this.opportunitiesService.moveStage(
      tenantId,
      opportunityId,
      newStageId,
    );
  }
}
