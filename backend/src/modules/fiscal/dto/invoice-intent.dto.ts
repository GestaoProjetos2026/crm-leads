import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InvoiceItemDto } from './invoice-item.dto';

/**
 * DTO for POST /v1/fiscal/invoice/intent.
 *
 * Sends items to the Fiscal API to calculate prices, taxes and totals
 * **without persisting** anything. Useful for preview/confirmation screens.
 */
export class InvoiceIntentDto {
  @ApiProperty({
    type: [InvoiceItemDto],
    description: 'Lista de itens para calcular a nota fiscal',
    example: [{ sku: 'PROD-001', quantidade: 2 }],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  itens!: InvoiceItemDto[];
}
