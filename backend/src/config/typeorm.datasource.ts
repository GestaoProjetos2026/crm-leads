import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.NODE_ENV === 'production' ? 'postgres-svc.infra-banco.svc.cluster.local' : 'localhost',
  port: parseInt('5432', 10),
  database: process.env.NODE_ENV === 'production' ? 'infra_banco' : 'sales_weakness',
  username: process.env.NODE_ENV === 'production' ? 'user_crm_leads' : 'salesweakness',
  password: process.env.NODE_ENV === 'production' ? 'SenhaCrm123!' : 'salesweakness',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: ['src/**/*.subscriber.ts'], 
});

export default AppDataSource;