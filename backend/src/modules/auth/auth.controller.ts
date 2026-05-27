import { Controller, Post, Body, HttpCode, HttpStatus, HttpException, NotImplementedException } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsIn } from 'class-validator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';

class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'core', description: 'Qual o tipo de login, se vai ser pelo `core` ou pelo `salesweakness`'})
  @IsString()
  @IsIn(['salesweakness', 'core'])
  type: 'salesweakness' | 'core';
}


class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;

  @ApiProperty({ example: 1, description: 'Tenant ID' })
  @IsNumber()
  tenantId: number;

  @ApiProperty({ example: 'sales_rep', description: 'User profile (director | marketing_manager | sales_rep)' })
  @IsString()
  @IsIn(['sales_rep', 'director', 'marketing_manager'])
  profile?: 'sales_rep' | 'director' | 'marketing_manager';
}

class RegisterResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 1 })
  tenantId: number;

  @ApiProperty({ example: 'sales_rep' })
  profile: string;
}

class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;
}

/**
 * AuthController — handles authentication endpoints.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    type: RegisterDto,
    description: 'Dados para registro de novo usuário',
    examples: {
      'novo-usuario': {
        summary: 'Exemplo de registro',
        value: {
          email: 'user@example.com',
          password: 'password123',
          tenantId: 1,
          profile: 'sales_rep',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou usuário já existe',
  })
  async register(@Body() body: RegisterDto): Promise<RegisterResponseDto> {
    const user = await this.authService.register(body);
    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      profile: user.profile,
    };
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
  })
  @ApiResponse({
    status: 410,
    description: 'Login is now handled by Core Engine Authentication API',
  })
  async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    if (body.type === 'salesweakness')
      return this.authService.login(body.email, body.password);
    else if (body.type === 'core')
      throw new NotImplementedException();

    throw new HttpException(
      'Unexpected Error',
      HttpStatus.BAD_REQUEST
    );
  }
}
