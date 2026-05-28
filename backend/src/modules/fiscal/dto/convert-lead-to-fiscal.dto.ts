import {
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for POST /v1/fiscal/leads/:leadId/convert.
 * All fields are optional — the service enriches the payload with
 * lead/opportunity data fetched from the database.
 */
export class ConvertLeadToFiscalDto {
  @ApiPropertyOptional({
    example: 42,
    description:
      'Opportunity ID to convert. If omitted, the most recent open opportunity for this lead is used.',
  })
  @IsOptional()
  @IsNumber()
  opportunityId?: number;

  @ApiPropertyOptional({
    example: 'Cliente solicitou NF imediata',
    description: 'Free-text notes to include in the fiscal conversion payload.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
