import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { LeadsModule } from './modules/leads/leads.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { AuditModule } from './modules/audit/audit.module';
import { StagesModule } from './modules/stages/stages.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { WorkerModule } from './modules/worker/worker.module';
import { Lead } from './modules/leads/entities/lead.entity';
import { Opportunity } from './modules/opportunities/entities/opportunity.entity';
import { Tenant } from './modules/tenants/entities/tenant.entity';
import { AuditLog } from './modules/leads/entities/audit-log.entity';
import { LeadStatusHistory } from './modules/leads/entities/lead-status-history.entity';

@Module({
  imports: [
    // Load all config namespaces globally so every module can inject them
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
    }),

    // Event system for lead.stagnated and future domain events
    EventEmitterModule.forRoot(),

    // TypeORM connected via ConfigService so credentials come from .env
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      entities: [Tenant, Lead, Opportunity, AuditLog, LeadStatusHistory],
      useFactory: (config: ConfigService): TypeOrmModuleOptions =>
        config.get<TypeOrmModuleOptions>('database') as TypeOrmModuleOptions,
    }),

    // Feature modules — each registers its own entities via forFeature()
    AuthModule,
    TenantsModule,
    LeadsModule,
    OpportunitiesModule,
    AuditModule,
    StagesModule,
    CampaignsModule,

    // Background workers (StagnationWorker with @Cron)
    WorkerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
