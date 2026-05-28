import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceItemDto } from './invoice-item.dto';

/**
 * DTO for POST /v1/fiscal/invoice/confirm.
 *
 * Confirms the invoice emission on the Fiscal API. This is an atomic
 * operation: validates stock, deducts stock, saves the invoice, and
 * registers a cashflow entry.
 */
export class InvoiceConfirmDto {
  @ApiProperty({
    example: 'NF-2026-001',
    description: 'Número único da nota fiscal',
  })
  @IsString()
  @MaxLength(50)
  numero!: string;

  @ApiPropertyOptional({
    example: 'Venda loja',
    description: 'Descrição / observação da nota fiscal',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string;

  @ApiProperty({
    type: [InvoiceItemDto],
    description: 'Itens da nota fiscal',
    example: [{ sku: 'PROD-001', quantidade: 2 }],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  itens!: InvoiceItemDto[];
}
