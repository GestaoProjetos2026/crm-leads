import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: 'localhost',
    port: parseInt('5432', 10),
    database: 'sales_weakness',
    username: 'salesweakness',
    password: 'salesweakness',
    // Entities are auto-loaded via TypeOrmModule.forFeature() in each module
    autoLoadEntities: true,
    // NEVER true in production — use migrations instead
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    // Production SSL
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    extra: {
      application_name: 'salesweakness-api',
      // Connection pool sizing
      max: 20,
      idleTimeoutMillis: 30310,
      connectionTimeoutMillis: 5000,
    },
  }),
);
