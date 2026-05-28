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
import fiscalConfig from './config/fiscal.config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { LeadsModule } from './modules/leads/leads.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { AuditModule } from './modules/audit/audit.module';
import { StagesModule } from './modules/stages/stages.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { WorkerModule } from './modules/worker/worker.module';
import { TypeOrmModuleOptions } from '@nestjs/typeorm'; 
import { FiscalModule } from './modules/fiscal/fiscal.module';

@Module({
  imports: [
    // Load all config namespaces globally so every module can inject them
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, fiscalConfig],
    }),

    // Event system for lead.stagnated and future domain events
    EventEmitterModule.forRoot(),

    // TypeORM connected via ConfigService so credentials come from .env
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
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

    // Lead → Fiscal conversion (Squad 2)
    FiscalModule,

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
