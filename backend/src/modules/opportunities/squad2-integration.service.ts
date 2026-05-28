import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Squad2IntegrationService {
  private readonly logger = new Logger(Squad2IntegrationService.name);

  constructor(private readonly httpService: HttpService) {}

  async getFaturamentoReal(): Promise<any[]> {
    // Chaveador explícito: Se a variável for 'true' ou se a URL não estiver configurada, usa o mock
    const useMock = process.env.SQUAD2_USE_MOCK === 'true' || !process.env.SQUAD2_API_URL;

    if (useMock) {
      this.logger.log('Chaveador ativado: Utilizando dados mockados para o Squad 2.');
      return [
        {
          id: 999,
          title: "Faturamento Integrado (Ambiente de Teste)",
          value: 45000,
          stageName: "Fechamento",
          leadName: "Cliente Teste",
          status: "WON"
        }
      ];
    }

    try {
      this.logger.log(`Chaveador desativado: Buscando faturamento real em ${process.env.SQUAD2_API_URL}`);
      const response = await firstValueFrom(this.httpService.get(process.env.SQUAD2_API_URL as string));
      return response.data;
    } catch (error) {
      this.logger.error('Erro ao conectar na API real do Squad 2. Retornando fallback vazio.', error);
      return []; 
    }
  }
}