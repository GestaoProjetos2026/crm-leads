import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for the POST /v1/leads/ingest endpoint.
 * Validates incoming lead data from external sources (Facebook Leads, Landing Pages, etc.).
 */
export class IngestLeadDto {
  @ApiProperty({ example: 'João', description: 'First name of the lead' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  firstName!: string;

  @ApiProperty({ example: 'Silva', description: 'Last name of the lead' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  lastName!: string;

  @ApiProperty({ example: 'joao@empresa.com', description: 'Email address' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    example: 'facebook_leads',
    description: 'Lead source channel (facebook_leads, landing_page, etc.)',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  source!: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Campaign ID the lead originated from',
  })
  @IsOptional()
  @IsNumber()
  campaignId?: number;
}
