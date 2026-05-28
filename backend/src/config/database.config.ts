import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: 'postgres-svc.infra-banco.svc.cluster.local',
    port: parseInt('5432', 10),
    database: 'infra_banco',
    username: 'user_crm_leads',
    password: 'SenhaCrm123!',
    schema: 'crm_leads',
    // Entities are auto-loaded via TypeOrmModule.forFeature() in each module
    autoLoadEntities: true,
    // NEVER true in production — use migrations instead
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    // Production SSL
    ssl: false,
    extra: {
      application_name: 'salesweakness-api',
      // Connection pool sizing
      max: 20,
      idleTimeoutMillis: 3000,
      connectionTimeoutMillis: 5000,
    },
  }),
);
