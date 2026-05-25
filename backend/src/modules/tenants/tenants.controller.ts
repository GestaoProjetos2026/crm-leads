import { Controller, Post, Body, HttpCode, HttpStatus, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { Public } from '../../common/decorators/public.decorator';
import { TenantsService } from './tenants.service';

class CreateTenantDto {
  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'starter',
    description: 'Subscription plan (free | starter | professional | enterprise)',
    required: false,
  })
  @IsOptional()
  @IsIn(['free', 'starter', 'professional', 'enterprise'])
  plan?: string;
}

class TenantResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Acme Corporation' })
  name: string;

  @ApiProperty({ example: 'starter' })
  plan: string;

  @ApiProperty({ example: false })
  isBlocked: boolean;

  @ApiProperty({ example: '2026-05-25' })
  createdAt: Date;
}

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    type: CreateTenantDto,
    description: 'Dados para criar um novo tenant',
    examples: {
      'novo-tenant': {
        summary: 'Exemplo de criação de tenant',
        value: {
          name: 'Acme Corporation',
          plan: 'starter',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tenant criado com sucesso',
    type: TenantResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  async create(@Body() body: CreateTenantDto): Promise<TenantResponseDto> {
    return this.tenantsService.create(body);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Tenant encontrado',
    type: TenantResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant não encontrado',
  })
  async getById(@Param('id', ParseIntPipe) id: number): Promise<TenantResponseDto | null> {
    return this.tenantsService.findById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Lista de tenants',
    type: [TenantResponseDto],
  })
  async getAll(): Promise<TenantResponseDto[]> {
    return this.tenantsService.findAll();
  }
}
