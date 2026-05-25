import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Squad2IntegrationService {
  private readonly logger = new Logger(Squad2IntegrationService.name);

  constructor(private readonly httpService: HttpService) {}

  async getFaturamentoReal(): Promise<any[]> {
    // Mock temporário para o front não quebrar enquanto não temos a URL
    if (!process.env.SQUAD2_API_URL) {
      return [
        {
          id: 999,
          title: "Faturamento Mock Squad 2",
          value: 45000,
          stageName: "Fechamento",
          leadName: "Cliente Teste",
          status: "WON"
        }
      ];
    }

    try {
      const response = await firstValueFrom(this.httpService.get(process.env.SQUAD2_API_URL));
      return response.data;
    } catch (error) {
      this.logger.error('Erro ao buscar faturamento do Squad 2', error);
      return []; // Retorna um array vazio para não quebrar o map() do FrontEnd
    }
  }
}