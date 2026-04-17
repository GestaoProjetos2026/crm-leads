import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockUserRepository.findOne.mockReset();
    mockJwtService.sign.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const passwordHash = await service.hashPassword('password');
      const user = {
        id: 1,
        email: 'test@example.com',
        passwordHash,
        profile: 'sales',
        tenantId: 1,
        tenant: { id: 1, name: 'Test Tenant' },
      } as User;
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const passwordHash = await service.hashPassword('password');
      const user = {
        id: 1,
        email: 'test@example.com',
        passwordHash,
        profile: 'sales',
        tenantId: 1,
        tenant: { id: 1, name: 'Test Tenant' },
      } as User;
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.validateUser('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const passwordHash = await service.hashPassword('password');
      const user = {
        id: 1,
        email: 'test@example.com',
        passwordHash,
        profile: 'sales',
        tenantId: 1,
        tenant: { id: 1, name: 'Test Tenant' },
      } as User;
      mockUserRepository.findOne.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.login('test@example.com', 'password');
      expect(result).toEqual({ access_token: 'token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        tenant_id: 1,
        profile: 'sales',
        scopes: ['leads:read', 'opportunities:read'],
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login('test@example.com', 'password')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const hash = await service.hashPassword('password');
      expect(hash).toBeDefined();
      expect(hash).toContain(':');
      const [salt, derived] = hash.split(':');
      expect(salt).toHaveLength(32);
      expect(derived).toHaveLength(128);
    });
  });
});
