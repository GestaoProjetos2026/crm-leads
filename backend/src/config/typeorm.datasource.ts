import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'postgres-svc.infra-banco.svc.cluster.local',
  port: parseInt('5432', 10),
  database: 'infra_banco',
  username: 'user_crm_leads',
  password: 'SenhaCrm123!',
  schema: 'crm_leads',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: ['src/**/*.subscriber.ts'], 
});

AppDataSource.initialize().then(async () => {}).catch(() => {})

const originalInitialize = AppDataSource.initialize.bind(AppDataSource);
AppDataSource.initialize = async () => {
  const ds = await originalInitialize();
  await ds.query(`CREATE SCHEMA IF NOT EXISTS "crm_leads"`);
  return ds;
};

export default AppDataSource;