import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Single line-item for an invoice request.
 * Used by both intent (preview) and confirm (emit) flows.
 */
export class InvoiceItemDto {
  @ApiProperty({
    example: 'PROD-001',
    description: 'SKU do produto conforme cadastrado no sistema Fiscal',
  })
  @IsString()
  sku!: string;

  @ApiProperty({
    example: 2,
    description: 'Quantidade de unidades',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantidade!: number;
}
