> **Status:** Em Revisão | **Versão:** 1.1 | **Última atualização:** 2026-03-07

## 1. Visão Geral e Proposta de Valor

### O Problema: Lead Frio e o Custo do Esquecimento

Em vendas, tempo é o ativo mais perecível. Leads parados em uma etapa do funil sem interação humana perdem o interesse de forma exponencial — fenômeno conhecido como **lead decay**. O problema se agrava em equipes maiores: gestores comerciais simplesmente não conseguem monitorar manualmente centenas ou milhares de oportunidades para identificar quais foram "esquecidas" pelos vendedores.

O resultado é direto: investimento de marketing desperdiçado por falha operacional, não por falta de interesse do lead.

### A Solução: Um Seguro contra Perda de Oportunidade

Este módulo atua como uma **camada de vigilância automatizada** sobre o funil de vendas. Ele detecta estagnações, notifica os responsáveis e gera inteligência de processo — garantindo que nenhuma oportunidade seja perdida por omissão ou esquecimento da equipe.

**Proposta de valor central:** o cliente paga para ter a certeza de que cada real investido em aquisição tem uma segunda chance antes de ser descartado.

## 2. Personas

| Persona                 | Papel no Contexto deste Módulo                        | Principal Dor Resolvida                                      |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| **Gestor Comercial**    | Configura SLAs e monitora gargalos no funil           | Identificar quais etapas estão travando o faturamento        |
| **SDR / Closer**        | Recebe alertas e prioriza ação sobre leads estagnados | Saber exatamente em quem focar ao iniciar o dia              |
| **Engenheiro de Dados** | Consome os logs estruturados para análises históricas | Construir relatórios de tendência de fragilidade operacional |

## 3. Requisitos Funcionais

### RF01 — Configuração de SLA por Etapa

O sistema deve permitir que usuários autorizados definam um **tempo máximo de permanência** (em horas ou dias) para cada estágio do funil.

* Exemplos de configuração: `Triagem = 2h`, `Qualificação = 24h`, `Proposta = 48h`

* O SLA deve ser configurável por funil, não apenas globalmente

* Deve haver um valor padrão (default) caso nenhum SLA seja configurado para a etapa

### RF02 — Varredura de Estagnação (Scanner)

O motor deve comparar o `timestamp` da última movimentação do lead (`last_moved_at`) com o SLA definido para a etapa atual.

* Um lead é considerado **estagnado** quando: `current_time - last_moved_at > SLA da etapa`

* A varredura deve ser executada de forma assíncrona por um background worker (ver RNF02)

* O resultado da varredura deve ser idempotente: reprocessar o mesmo lead não deve gerar registros duplicados

### RF03 — Registro de Fragilidade (Audit Log)

Sempre que um lead exceder o SLA da sua etapa atual, o sistema deve inserir um registro estruturado na tabela `audit_logs`.

* Categoria do evento: `WEAKNESS_STAGNATION`

* O registro deve conter: `lead_id`, `stage_id`, `company_id`, `sla_limit`, `elapsed_time`, `detected_at`

* Registros devem ser imutáveis após criação (append-only)

### RF04 — Cálculo de Latência de Conversão

O sistema deve calcular o **tempo médio de transição** de leads entre etapas consecutivas (etapa A → etapa B) para fins de benchmarking e identificação de gargalos recorrentes.

* A métrica deve ser calculável por período (ex: últimos 30/60/90 dias)

* Deve ser acessível via endpoint dedicado (ver Seção 5)

* Serve como base para que gestores calibrem os SLAs com dados reais do histórico

## 4. Requisitos Não-Funcionais

### RNF01 — Segurança e Isolamento de Tenant

O motor de varredura deve operar estritamente dentro do **Tenant Context**. Todas as queries de detecção devem ser filtradas por `company_id`, garantindo isolamento total entre contas e eliminando o risco de processamento cruzado de dados.

### RNF02 — Performance e Processamento Assíncrono

A detecção de estagnação **não deve ocorrer de forma síncrona** na requisição do usuário. Todo o processamento deve ser delegado a um **background worker**, evitando qualquer impacto de latência na experiência do CRM.

* Intervalo de execução do worker: entre 15 e 30 minutos (configurável via variável de ambiente)

### RNF03 — Escalabilidade por Batch Processing

O motor deve processar leads em **lotes (batches)** de 500 a 1.000 registros por ciclo de execução, prevenindo estouro de memória em contas com grandes bases de dados.

* O tamanho do batch deve ser configurável

* Em caso de falha parcial de um batch, apenas os registros com erro devem ser reprocessados (sem reprocessar o lote inteiro)

## 5. Especificação Técnica e Integração

### Endpoints de API

| Método | Endpoint                       | Descrição                                                          |
| ------ | ------------------------------ | ------------------------------------------------------------------ |
| `GET`  | `/v1/audit/bottlenecks`        | Lista os leads atualmente estagnados, filtrados por `company_id`   |
| `POST` | `/v1/config/stages/{id}/sla`   | Define ou atualiza o tempo limite de SLA para uma etapa específica |
| `GET`  | `/v1/audit/conversion-latency` | Retorna o tempo médio de transição entre etapas (RF04)             |

> Todos os endpoints devem retornar erros padronizados conforme documentação Swagger atualizada (ver DoD).

### Webhooks

| Evento           | Gatilho                                                      | Payload Sugerido                                                                |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `lead.stagnated` | Disparado no momento em que o worker detecta a quebra de SLA | `lead_id`, `stage_id`, `company_id`, `elapsed_time`, `sla_limit`, `detected_at` |

### Modelo de Dados

Este módulo opera sobre três entidades principais:

```
Stages ──────────────────────────────────────────────────────────────┐
  └─ sla_limit (horas/dias configurado pelo gestor)                   │
                                                                       ▼
Opportunities ──────────────────────────────────────────── Audit_Logs
  └─ last_moved_at (timestamp da última transição)            └─ WEAKNESS_STAGNATION
  └─ current_stage_id                                           └─ gerado pelo worker
  └─ company_id                                                  └─ append-only
```

**Relação:** o worker lê `Stages` (SLA Config) e `Opportunities` (estado atual), compara os tempos e, ao detectar violação, grava em `Audit_Logs`.

## 6. User Stories

**US01 — Configuração de SLA pelo Gestor**

> _"Como Gestor Comercial, quero definir que um lead não pode ficar mais de 24h em 'Primeiro Contato', para que eu possa cobrar agilidade da minha equipe com base em critérios objetivos."_

**US02 — Sinalização Visual para o SDR**

> _"Como SDR, quero que o sistema sinalize visualmente (ex: destaque em vermelho) os leads estagnados na minha lista, para que eu saiba exatamente em quem ligar ao chegar no trabalho, sem precisar verificar manualmente."_

**US03 — Log Estruturado para Análise de Dados**

> _"Como Engenheiro de Dados, quero que cada quebra de SLA gere um log estruturado e imutável, para que eu possa construir séries históricas e gráficos de tendência de fragilidade operacional ao longo do semestre."_

## 7. Definição de Pronto (Definition of Done)

* [ ] Lógica de cálculo de diferença de tempo (`current_time - last_moved_at`) testada para múltiplos fusos horários, incluindo horário de verão

* [ ] Worker configurado para rodar em intervalos de 15 a 30 minutos, com intervalo ajustável via variável de ambiente

* [ ] Idempotência da varredura validada: reprocessar o mesmo lead não gera registros duplicados em `audit_logs`

* [ ] Testes unitários com cobertura > 80%, priorizando casos de borda: lead movido e revertido à etapa anterior, SLA configurado como zero, lead sem `last_moved_at`

* [ ] Endpoint `GET /v1/audit/bottlenecks` retornando resultados isolados por `company_id` (validado com testes multi-tenant)

* [ ] Documentação da API atualizada no Swagger, incluindo novos códigos de erro e schema do payload do webhook

* [ ] Registros de auditoria validados no banco de dados com todos os campos obrigatórios preenchidos

* [ ] Comportamento de falha parcial de batch documentado e testado

## 8. Riscos e Dependências

| Item                                                 | Tipo                 | Impacto | Mitigação                                                       |
| ---------------------------------------------------- | -------------------- | ------- | --------------------------------------------------------------- |
| Volume elevado de leads em contas enterprise         | Risco de Performance | Alto    | Batch processing + monitoramento de tempo de execução do worker |
| SLA configurado como `0` ou nulo                     | Risco de Lógica      | Médio   | Validação no endpoint de configuração + valor default           |
| Clock skew entre servidores                          | Risco de Precisão    | Médio   | Usar UTC em todos os timestamps; testar com fusos extremos      |
| Worker acumulando execuções atrasadas (backpressure) | Risco Operacional    | Alto    | Implementar dead-letter queue e alertas de atraso               |

_Documento gerado com base na versão inicial da PRD [UC06]. Melhorias incluem: adição da persona Engenheiro de Dados, detalhamento de casos de borda nos RFs, tabela de modelo de dados, seção de Riscos e expansão da DoD._
