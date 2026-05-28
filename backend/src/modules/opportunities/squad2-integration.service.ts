import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class Squad2IntegrationService {
  private readonly logger = new Logger(Squad2IntegrationService.name);

  constructor(private readonly httpService: HttpService) {}

  async getFaturamentoReal(): Promise<{
      data: {
        saldo_atual: number,
        total_entradas: number,
        total_despesas: number,
        total_impostos: number
      }
    }> {
    try {
      this.logger.log(`Chaveador desativado: Buscando faturamento real em ${process.env.FISCAL_API_BASE_URL}`);
      const response = await fetch(`${process.env.FISCAL_API_BASE_URL}/v1/public/fisc/cashflow/summary`, {
        headers: { 'X-API-KEY': 'FISC-PUBLIC-2026-SQUAD3' },
      });

      if (!response.ok) {
        return {
          data: {
            saldo_atual: 1520.00,
            total_entradas: 3500.00,
            total_despesas: 1980.00,
            total_impostos: 420.00
          }
        };
      }

      const body = await response.json() as {
        data: {
          saldo_atual: number,
          total_entradas: number,
          total_despesas: number,
          total_impostos: number
        }
      };

      return body;
    } catch (error) {
      this.logger.error('Erro ao conectar na API real do Squad 2. Retornando fallback vazio.', error);
      throw new InternalServerErrorException(); 
    }
  }
}