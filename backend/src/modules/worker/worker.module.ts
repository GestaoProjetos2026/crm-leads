import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StagnationWorker } from './stagnation.worker';
import { Opportunity } from '../opportunities/entities/opportunity.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { Stage } from '../stages/entities/stage.entity';

/**
 * WorkerModule — houses all background jobs.
 * Imports ScheduleModule so @Cron() decorators are discovered.
 */
@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Opportunity, AuditLog, Stage]),
  ],
  providers: [StagnationWorker],
})
export class WorkerModule {}
