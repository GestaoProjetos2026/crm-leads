import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standardised response returned after attempting a lead → Fiscal conversion.
 * Wraps the external API result so the frontend has a predictable contract.
 */
export class FiscalConversionResponseDto {
  @ApiProperty({ example: true, description: 'Whether the conversion succeeded' })
  success!: boolean;

  @ApiProperty({ example: 123, description: 'Lead ID that was converted' })
  leadId!: number;

  @ApiPropertyOptional({
    example: 'FISCAL-2026-00042',
    description: 'Reference ID returned by the Finance-Fiscal API',
  })
  fiscalReferenceId?: string;

  @ApiProperty({
    example: '2026-05-26T22:50:00.000Z',
    description: 'Timestamp of the conversion attempt',
  })
  convertedAt!: string;

  @ApiPropertyOptional({
    example: 'Conversão enviada com sucesso para o Fiscal.',
    description: 'Human-readable message about the result',
  })
  message?: string;
}
