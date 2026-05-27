import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from '../leads/entities/lead.entity';
import { Opportunity } from '../opportunities/entities/opportunity.entity';
import { FiscalService } from './fiscal.service';
import { FiscalController } from './fiscal.controller';

/**
 * FiscalModule — handles lead conversion dispatching to the
 * Finance-Fiscal API (Squad 2).
 *
 * Registers HttpModule for outbound HTTP calls and imports
 * Lead + Opportunity repositories for data enrichment.
 */
@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
    TypeOrmModule.forFeature([Lead, Opportunity]),
  ],
  controllers: [FiscalController],
  providers: [FiscalService],
  exports: [FiscalService],
})
export class FiscalModule {}
