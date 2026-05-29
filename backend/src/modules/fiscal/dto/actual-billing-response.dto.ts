import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standardised wrapper returned by the CRM's invoice proxy endpoints.
 * Mirrors the Fiscal API envelope so the frontend has a predictable contract.
 */
export class ActualBillingResponseDto {
  @ApiProperty({
    example: '1520.00',
    description: 'Valor do Saldo atual no sistema',
  })
  saldo_atual!: number;

  @ApiProperty({
    example: '3500.00',
    description: 'Valor do total de entradas no sistema',
  })
  total_entradas!: number;

  @ApiPropertyOptional({
    example: '1980.00',
    description: 'Valor do total de despesas no sistema',
  })
  total_despesas?: number;

  @ApiPropertyOptional({
    example: '420.00',
    description: 'Valor do total de imposto no sistema',
  })
  total_impostos?: number;
}
