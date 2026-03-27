import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';

<<<<<<< HEAD
@ApiTags('audit')
@Controller('audit')
=======
/**
 * AuditController — stub for Step 01.
 * GET /v1/funnel/audit endpoint implemented in Step 06.
 */
@ApiTags('audit')
@Controller('funnel')
>>>>>>> origin/copilot/read-project-documents
export class AuditController {
  constructor(private readonly auditService: AuditService) {}
}
