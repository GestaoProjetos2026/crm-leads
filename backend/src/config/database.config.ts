import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.NODE_ENV === 'production' ? 'postgres-svc.infra-banco.svc.cluster.local' : 'localhost',
    port: parseInt('5432', 10),
    database: process.env.NODE_ENV === 'production' ? 'infra_banco' : 'sales_weakness',
    username: process.env.NODE_ENV === 'production' ? 'user_crm_leads' : 'salesweakness',
    password: process.env.NODE_ENV === 'production' ? 'SenhaCrm123!' : 'salesweakness',
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
      idleTimeoutMillis: 30310,
      connectionTimeoutMillis: 5000,
    },
  }),
);
