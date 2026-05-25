import { Controller, Post, Body, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';

class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;
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

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.GONE)
  @ApiBody({
    type: LoginDto,
    description: 'DEPRECATED: User login credentials',
  })
  @ApiResponse({
    status: 410,
    description: 'Login is now handled by Core Engine Authentication API',
  })
  async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    throw new HttpException(
      'Authentication is now handled by the Core Engine API.',
      HttpStatus.GONE,
    );
  }
}
