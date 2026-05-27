import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'sqlite',
    database:
      process.env.NODE_ENV === 'production'
        ? '/data/infra_banco.sqlite'
        : './database.sqlite',
    // Entities are auto-loaded via TypeOrmModule.forFeature() in each module
    autoLoadEntities: true,
    // NEVER true in production — use migrations instead
    synchronize: process.env.NODE_ENV !== 'production',
  }),
);