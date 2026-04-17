import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/modules/auth/entities/user.entity';
import { Tenant } from '../src/modules/tenants/entities/tenant.entity';
import { AuthService } from '../src/modules/auth/auth.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let userRepository: Repository<User>;
  let tenantRepository: Repository<Tenant>;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    tenantRepository = moduleFixture.get<Repository<Tenant>>(getRepositoryToken(Tenant));
    authService = moduleFixture.get<AuthService>(AuthService);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/v1/auth/login (POST)', () => {
    let testTenant: Tenant;
    let testUser: User;

    beforeEach(async () => {
      // Create test tenant
      testTenant = await tenantRepository.save({
        name: 'Test Tenant',
        plan: 'starter',
      });

      // Create test user
      const hashedPassword = await authService.hashPassword('password123');
      testUser = await userRepository.save({
        email: 'test@example.com',
        passwordHash: hashedPassword,
        profile: 'sales',
        tenantId: testTenant.id,
      });
    });

    afterEach(async () => {
      await userRepository.delete({});
      await tenantRepository.delete({});
    });

    it('should login successfully with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(typeof res.body.access_token).toBe('string');
        });
    });

    it('should return 401 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should return 401 for invalid password', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 403 for blocked tenant login', async () => {
      const blockedTenant = await tenantRepository.save({
        name: 'Blocked Tenant',
        plan: 'starter',
        isBlocked: true,
      });

      await userRepository.save({
        email: 'blocked@example.com',
        passwordHash: await authService.hashPassword('password123'),
        profile: 'sales',
        tenantId: blockedTenant.id,
      });

      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'blocked@example.com',
          password: 'password123',
        })
        .expect(403);
    });
  });
});
