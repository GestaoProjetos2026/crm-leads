import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standardised wrapper returned by the CRM's invoice proxy endpoints.
 * Mirrors the Fiscal API envelope so the frontend has a predictable contract.
 */
export class InvoiceProxyResponseDto {
  @ApiProperty({
    example: 'success',
    description: 'Status da operação na API do Fiscal',
  })
  status!: string;

  @ApiProperty({
    description: 'Dados retornados pela API do Fiscal',
    example: {},
  })
  data!: Record<string, unknown> | null;

  @ApiPropertyOptional({
    example: 'Intenção calculada. Use /invoice/confirm para confirmar.',
    description: 'Mensagem descritiva retornada pela API do Fiscal',
  })
  message?: string;
}
