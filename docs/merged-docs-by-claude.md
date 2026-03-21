# SalesWeakness — Documentação Técnica Consolidada

> **Versão:** 1.0 | **Classificação:** Confidencial — Uso Interno  
> **Última atualização:** Março de 2025  
> **Elaborado por:** Equipe de Produto e Engenharia

---

## Índice

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [O Problema que o Sistema Resolve](#2-o-problema-que-o-sistema-resolve)
3. [Proposta de Valor](#3-proposta-de-valor)
4. [Perfis de Usuário (Personas)](#4-perfis-de-usuário-personas)
5. [Arquitetura do Sistema](#5-arquitetura-do-sistema)
6. [Módulos do Sistema](#6-módulos-do-sistema)
7. [Principais Funcionalidades](#7-principais-funcionalidades)
8. [Fluxo do Funil de Vendas Monitorado](#8-fluxo-do-funil-de-vendas-monitorado)
9. [Dashboards por Perfil de Usuário](#9-dashboards-por-perfil-de-usuário)
10. [APIs e Integrações](#10-apis-e-integrações)
11. [Modelo de Dados](#11-modelo-de-dados)
12. [Regras de Negócio](#12-regras-de-negócio)
13. [Casos de Uso Priorizados](#13-casos-de-uso-priorizados)
14. [KPIs e Métricas](#14-kpis-e-métricas)
15. [User Stories (Backlog)](#15-user-stories-backlog)
16. [Definição de Pronto (Definition of Done)](#16-definição-de-pronto-definition-of-done)
17. [Escopo Negativo — O que NÃO está no MVP](#17-escopo-negativo--o-que-não-está-no-mvp)
18. [Roadmap e Possíveis Evoluções](#18-roadmap-e-possíveis-evoluções)
19. [Glossário](#19-glossário)

---

## 1. Visão Geral do Produto

O **SalesWeakness** é uma plataforma SaaS integrada de **CRM (Customer Relationship Management) e Automação de Marketing**, cujo diferencial central reside no **diagnóstico ativo de performance comercial**.

Enquanto ferramentas tradicionais de CRM limitam-se ao registro passivo de dados — respondendo *quanto* foi vendido —, o SalesWeakness atua como um **auditor contínuo do funil de vendas**, rastreando cada etapa da jornada do cliente para identificar gargalos, falhas de execução e oportunidades perdidas em campanhas de marketing e processos comerciais.

A plataforma responde à pergunta que nenhum CRM convencional responde: **por que você não vendeu mais?**

---

## 2. O Problema que o Sistema Resolve

Organizações de vendas frequentemente enfrentam os seguintes desafios estruturais:

- **Falta de diagnóstico de causa**: CRMs tradicionais registram resultados, mas não identificam por que leads não convertem.
- **Leads esfriando por inatividade**: ausência de follow-up oportuno gera perda de timing comercial.
- **Atribuição de falha indefinida**: dificuldade em distinguir se a falha está na qualidade dos leads gerados pelo marketing ou na abordagem comercial pós-clique.
- **Ausência de classificação de perdas**: sem registrar o motivo de cada oportunidade perdida, decisões estratégicas tornam-se baseadas em intuição, não em dados.
- **ROI de campanhas deteriorado por ineficiências invisíveis**: campanhas são pausadas ou ajustadas com base em dados incompletos, sem considerar falhas internas do processo comercial.

O SalesWeakness endereça esses problemas ao transformar dados brutos de pipeline em **inteligência acionável**, sinalizando automaticamente onde e por que as vendas não acontecem.

---

## 3. Proposta de Valor

> *"Transformamos dados brutos em inteligência acionável. O SalesWeakness não apenas diz quanto você vendeu — ele aponta exatamente por que você não vendeu mais, revelando as fragilidades ocultas que corroem o ROI das suas campanhas."*

Os quatro pilares de valor da plataforma:

| Pilar | Descrição |
|---|---|
| **Diagnóstico Ativo** | Identificação automática de gargalos, leads estagnados e campanhas com baixa conversão. |
| **Inteligência de Perda** | Relatórios de auditoria que classificam e quantificam os motivos de perda de oportunidades. |
| **Automação de Reativação** | Réguas de disparo automático (e-mail/WhatsApp) para recuperar leads em risco de abandono. |
| **Rastreabilidade Completa** | Histórico auditável da origem de cada lead até o resultado final (ganho, perdido ou inativo). |

---

## 4. Perfis de Usuário (Personas)

O SalesWeakness foi projetado para atender três perfis distintos de usuário, cada um com objetivos, necessidades e escopos de acesso específicos.

### 4.1 Diretor Comercial — O Estrategista

**Perfil de acesso:** `director` | JWT Scope: `analytics:read`

**Objetivo principal:** Obter visão macro do desempenho comercial e identificar o "custo da ineficiência" — onde a equipe está perdendo dinheiro e por quê.

**Principais necessidades:**
- Relatórios de auditoria consolidados do funil de vendas.
- ROI por campanha (receita gerada vs. budget investido).
- Ranking de gargalos por etapa e por período.
- Alertas automáticos quando a taxa de conversão cair significativamente.

---

### 4.2 Gestor de Tráfego / Marketing — O Fornecedor

**Perfil de acesso:** `marketing_manager` | JWT Scopes: `campaigns:read`, `leads:read`

**Objetivo principal:** Comprovar que os leads entregues são qualificados e evidenciar que eventuais falhas de conversão são de responsabilidade comercial — não do marketing.

**Principais necessidades:**
- Qualidade dos leads por fonte e campanha.
- Velocidade de primeiro contato da equipe comercial com novos leads.
- Taxa de estagnação por campanha.
- Alertas de campanhas com baixa conversão (webhook `campaign.low_conversion`).

---

### 4.3 SDR / Vendedor — O Executor

**Perfil de acesso:** `sales_rep` | JWT Scopes: `deals:read`, `deals:write`

**Objetivo principal:** Gerenciar o próprio pipeline, priorizar ações e não perder o timing de vendas por inatividade ou esquecimento.

**Principais necessidades:**
- Visão Kanban do pipeline individual com indicadores de urgência.
- Fila de ação imediata priorizada por tempo de inatividade.
- Histórico de automações disparadas para cada lead.
- Alertas de leads próximos à data esperada de fechamento.

---

## 5. Arquitetura do Sistema

### 5.1 Visão de Alto Nível

O SalesWeakness é estruturado como uma plataforma **SaaS multi-tenant**, com arquitetura orientada a serviços, isolamento lógico de dados e suporte a processamento assíncrono.

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND WEB (Responsivo)               │
│          Dashboards | Kanban | Relatórios | Configurações    │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS / WebSocket
┌────────────────────────────▼────────────────────────────────┐
│                        API GATEWAY                          │
│              Autenticação JWT | Roteamento | RLS            │
└──────┬─────────────────────┬──────────────────────┬─────────┘
       │                     │                      │
┌──────▼──────┐   ┌──────────▼──────────┐   ┌──────▼──────────┐
│  Serviço    │   │  Serviço de         │   │  Serviço de     │
│  de CRM     │   │  Analytics          │   │  Automação      │
│  (Pipeline) │   │  (Funil / Audit)    │   │  (Réguas)       │
└──────┬──────┘   └──────────┬──────────┘   └──────┬──────────┘
       │                     │                      │
       └─────────────────────┼──────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    CAMADA DE DADOS                           │
│  PostgreSQL (RLS)  |  Redis (Cache)  |  Message Queue       │
│                    |                 |  (RabbitMQ/SQS)      │
└─────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│               WORKERS / CRON JOBS (Background)              │
│    Detecção de Estagnação 48h | Inatividade 180d | Webhooks │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Componentes da Arquitetura

| Camada | Componente | Responsabilidade |
|---|---|---|
| Frontend | Interface Web Responsiva | Dashboards por perfil, Kanban de pipeline, relatórios de auditoria |
| API Gateway | API REST (v1) | Entrada centralizada, autenticação JWT, roteamento |
| Backend | Serviços de Negócio | Lógica de CRM, automação, detecção de gargalos, webhooks |
| Processamento Assíncrono | Workers / Cron Jobs | Detecção de estagnação (48h), inatividade de longo prazo (180d) |
| Mensageria | Message Queue | Filas de disparo de automações, webhooks e notificações |
| Banco de Dados | PostgreSQL com RLS | Persistência multi-tenant com isolamento por Row Level Security |
| Cache | Redis | Cache de agregados de analytics (P95 < 300ms) |
| Infraestrutura | Docker / Kubernetes | Containerização e orquestração para escalabilidade horizontal |
| Segurança | JWT + Feature Flags | Controle de acesso por escopo e habilitação de módulos por tenant |

### 5.3 Modelo de Segurança e Multi-tenancy

A plataforma adota arquitetura **multi-tenant com isolamento lógico** via **Row Level Security (RLS)** no PostgreSQL. Isso garante que os dados de um tenant (empresa cliente) nunca sejam acessíveis a outro em nível de query SQL.

O controle de acesso opera em duas camadas:

- **JWT Scopes:** definem quais recursos cada perfil de usuário pode acessar (leitura, escrita, analytics).
- **Feature Flags:** habilitam ou desabilitam módulos contratados individualmente por tenant, suportando o modelo comercial de upsell gradual.

### 5.4 Stack Tecnológica

| Categoria | Tecnologia |
|---|---|
| Backend | Node.js com Express ou NestJS |
| Banco de Dados Relacional | PostgreSQL (ideal para Row Level Security) |
| Cache e Analytics | Redis (agregados de funil com TTL configurável) |
| Mensageria / Filas | RabbitMQ ou AWS SQS |
| Infraestrutura | Docker e Kubernetes (K8s) |
| Documentação de API | Swagger / OpenAPI 3.0 |
| Pipeline CI/CD | Não especificado (a definir pela equipe de engenharia) |

### 5.5 Requisitos Não-Funcionais

| Requisito | Especificação |
|---|---|
| **Latência (Analytics)** | API de funil deve responder com P95 < 300ms, utilizando cache Redis. |
| **Escalabilidade** | Suporte a picos de carga (ex: Black Friday) via containers Docker/K8s sem degradação de serviço. |
| **Throughput de Webhooks** | Capacidade de processar 10.000 webhooks/hora com taxa de erro inferior a 1%. |
| **Segurança** | Multi-tenant com RLS; dados pessoais protegidos; acesso controlado por JWT Scopes. |
| **Disponibilidade** | Não especificado (SLA a definir). |

---

## 6. Módulos do Sistema

O SalesWeakness é composto por quatro módulos funcionais integrados:

### 6.1 Módulo de CRM

Gerencia o pipeline de vendas, leads, oportunidades e estágios do funil. Inclui:
- Cadastro e movimentação de oportunidades por etapas.
- Visão Kanban do pipeline por vendedor.
- Rastreamento de datas, valores e probabilidades de fechamento.
- Classificação obrigatória de motivo ao fechar oportunidade como perdida.

### 6.2 Módulo de Diagnóstico e Auditoria

Núcleo diferencial da plataforma. Responsável por:
- Detecção automática de leads estagnados (regra de 48h via Worker/Cron).
- Geração de registros em `audit_logs` com tipo de fragilidade detectada.
- Relatório de auditoria de funil com taxas de conversão, gargalos e custo da ineficiência.
- Identificação de leads inativos de longo prazo (180 dias).

### 6.3 Módulo de Automação (Réguas de Reativação)

Responsável por ações automatizadas de recuperação de leads:
- Criação de réguas de disparo baseadas em fragilidades detectadas.
- Envio de e-mails e mensagens WhatsApp via integração com APIs externas.
- Gestão de filas de mensageria com retry logic e rastreamento de envios.
- Registro do histórico de automações por lead para contexto comercial.

### 6.4 Módulo de Analytics e Dashboards

Apresenta dados agregados por perfil de usuário:
- Dashboard do Diretor Comercial (visão macro, ROI, gargalos).
- Dashboard do Gestor de Marketing (qualidade de leads, velocidade de contato).
- Dashboard do SDR/Vendedor (pipeline individual, fila de ação).
- Exportação de relatórios em CSV de forma assíncrona.

---

## 7. Principais Funcionalidades

### 7.1 Detecção de Gargalos — Bottleneck Detection (RF01)

O sistema monitora continuamente o campo `updated_at` de cada oportunidade ativa. Quando um lead permanece sem movimentação por **48 horas consecutivas**, o sistema executa automaticamente:

1. Marca o lead com status **Estagnado**.
2. Gera registro em `audit_logs` com `weakness_type = 'Stagnation'`.
3. Dispara o webhook `lead.stagnated` para sistemas integrados ou réguas de automação.

**Implementação técnica:** Workers de background (Cron Jobs) processam oportunidades em lote, comparando `updated_at` com o timestamp atual. O processo é otimizado para não impactar a performance do banco de dados.

---

### 7.2 Automação de Recuperação de Leads — Réguas de Reativação (RF05)

O módulo de automação permite configurar réguas de disparo baseadas exclusivamente em fragilidades detectadas. Ao identificar um lead estagnado, o sistema pode acionar:

- Envio de **e-mail personalizado** de reengajamento.
- Disparo de **mensagem WhatsApp** via API de terceiros integrada por webhook.

As automações são gerenciadas por filas de mensageria (Redis / RabbitMQ), garantindo:
- Resiliência a falhas de entrega.
- Retry logic em caso de timeout ou erro da API externa.
- Rastreamento de cada envio para consulta posterior pelo SDR.

---

### 7.3 Relatório de Auditoria de Funil (GET /v1/funnel/audit)

Consolida os dados de performance do funil, respondendo à pergunta central do produto. Inclui:

- **Taxa de conversão por etapa:** Prospecção → Qualificação → Negociação → Fechamento.
- **Custo da ineficiência:** valor total de oportunidades perdidas, agrupado por `audit_logs.weakness_type`.
- **Ranking de gargalos:** etapas com maior tempo médio de permanência de leads.
- **ROI por campanha:** receita gerada vs. `campaigns.budget`.

**Implementação técnica:** Queries com CTEs (Common Table Expressions) e cálculos de médias móveis. Resultados cacheados no Redis para garantir latência P95 < 300ms.

---

### 7.4 Classificação Obrigatória de Motivo de Perda (RF04)

Ao fechar uma oportunidade com status **Lost**, o sistema bloqueia a operação até que o usuário classifique o motivo da perda. Categorias padrão:

- Preço
- Concorrência
- Falta de Contato
- *(Categorias adicionais a definir pela equipe de produto)*

Essa classificação alimenta o campo `lost_reason` em `opportunities` e é fundamental para os relatórios de inteligência de perda.

---

### 7.5 Ingestão de Leads via API (RF02)

A API de ingestão recebe leads de diversas fontes externas com as seguintes características:

- **Ingestão passiva:** apenas registro e persistência do dado — sem distribuição automática (round robin).
- **Resiliência a payloads variados:** tratamento de diferentes estruturas de dados de fontes distintas.
- **Prevenção de duplicidade:** identificação e rejeição de leads duplicados.
- **Rastreabilidade de origem:** campos `source` e `campaign_id` registrados para análise de qualidade por canal.

---

### 7.6 Ciclo de Vida de Leads e Gestão de Inatividade (RF03)

Leads sem qualquer interação por **180 dias consecutivos** são tratados automaticamente:

- Campo `is_inactive` atualizado para `true`.
- Webhook `lead.inactive` disparado para sistemas integrados.
- **Dados preservados:** o registro NÃO é deletado, mantendo histórico completo para auditoria e BI.

Esta abordagem garante conformidade com boas práticas de governança de dados e preserva o valor histórico das campanhas.

---

## 8. Fluxo do Funil de Vendas Monitorado

### 8.1 Etapas do Pipeline

```
[Ingestão] → [Prospecção] → [Qualificação] → [Negociação] → [Fechamento]
                                                                    │
                                                          ┌─────────┴─────────┐
                                                       [Won]               [Lost]
                                                                       (motivo obrigatório)

[Qualquer Etapa] ──── sem interação 48h ────► [Estagnado] ──► lead.stagnated
[Qualquer Etapa] ──── sem interação 180d ───► [Inativo]   ──► lead.inactive
```

### 8.2 Estados de uma Oportunidade

| Status | Descrição | Ação Requerida |
|---|---|---|
| `Open` | Oportunidade em andamento no pipeline. | Nenhuma obrigatória. |
| `Won` | Oportunidade fechada com sucesso. | Nenhuma. |
| `Lost` | Oportunidade perdida. | Preenchimento obrigatório de `lost_reason`. |

### 8.3 Pontos de Diagnóstico — Onde o Sistema Identifica Falhas

| Ponto de Diagnóstico | Tipo de Fragilidade | Ação Automática |
|---|---|---|
| Lead parado 48h em qualquer etapa | `Stagnation` | Gera `audit_log` + dispara `lead.stagnated` |
| Oportunidade fechada como Lost | Perda documentada | Exige `lost_reason`; alimenta relatório de fraquezas |
| ROI de campanha abaixo do limiar | `Low_Conversion` | Dispara `campaign.low_conversion` |
| Tempo elevado entre ingestão e 1º contato | Falha de velocidade comercial | Evidenciado no Dashboard do Gestor de Marketing |
| Lead sem interação por 180+ dias | Inatividade de longo prazo | `is_inactive = true` + dispara `lead.inactive` |

---

## 9. Dashboards por Perfil de Usuário

### 9.1 Dashboard do Diretor Comercial

**Rota:** `/dashboard/director`  
**Endpoint de dados:** `GET /v1/funnel/audit` (cache Redis, P95 < 300ms)

| Widget | Descrição |
|---|---|
| **Funil de Conversão Geral** | Taxa de conversão entre cada etapa do pipeline. |
| **Custo da Ineficiência** | Valor total de oportunidades perdidas, agrupado por motivo. |
| **ROI por Campanha** | Receita gerada vs. budget investido (`campaigns.budget`). |
| **Ranking de Gargalos** | Etapas com maior tempo médio de permanência de leads. |

**Funcionalidades adicionais:**
- Filtros por período, campanha ou vendedor responsável.
- Navegação direta para o relatório de auditoria ao clicar em um gargalo.
- Estado vazio com orientação para importar leads quando não há dados no período.

---

### 9.2 Dashboard do Gestor de Marketing

**Rota:** `/dashboard/marketing`

| Widget | Descrição |
|---|---|
| **Qualidade dos Leads por Fonte** | Taxa de avanço da etapa Prospecção para Qualificação, por `leads.source`. |
| **Velocidade de Primeiro Contato** | Tempo médio entre `leads.created_at` e primeira movimentação no pipeline. |
| **Taxa de Estagnação por Campanha** | Percentual de leads estagnados por campanha. |
| **Alertas de Baixa Performance** | Campanhas que dispararam `campaign.low_conversion` com ROI atual vs. limiar. |

**Funcionalidades adicionais:**
- Exportação **assíncrona** de relatório de qualidade de leads em CSV.
- Aviso quando campanha não possui leads ingeridos, com link para configurar webhook.

---

### 9.3 Dashboard do SDR / Vendedor

**Rota:** `/dashboard/sales-rep`  
**Isolamento:** RLS garante que cada vendedor veja apenas suas próprias oportunidades.

| Widget | Descrição |
|---|---|
| **Meu Pipeline (Kanban)** | Visão Kanban por etapa com indicador visual de urgência (borda vermelha após 48h). |
| **Fila de Ação Imediata** | Lista priorizada por tempo de inatividade e `stages.probability_percent`. |
| **Próximas Datas de Fechamento** | Oportunidades com `expected_close_date` nos próximos 7 dias. |
| **Histórico de Automações** | E-mails e mensagens WhatsApp disparados automaticamente por lead. |

**Requisito técnico:** Kanban deve atualizar em **tempo real** via WebSocket ou polling curto, sem necessidade de recarregar a página.

---

## 10. APIs e Integrações

### 10.1 Endpoints da API REST

```http
POST   /v1/leads/ingest
PATCH  /v1/deals/{id}/status
GET    /v1/funnel/audit
```

#### `POST /v1/leads/ingest`
Recebe e registra leads de fontes externas.

```json
// Exemplo de payload (campos mínimos obrigatórios)
{
  "first_name": "João",
  "last_name": "Silva",
  "email": "joao.silva@email.com",
  "source": "facebook_leads",
  "campaign_id": 42
}
```

- **Comportamento:** ingestão passiva — apenas registro no banco, sem distribuição automática.
- **Validações:** `source` e `campaign_id` obrigatórios; verificação de duplicidade por e-mail.

---

#### `PATCH /v1/deals/{id}/status`
Atualiza o estágio de uma oportunidade no pipeline.

```json
// Exemplo de payload
{
  "stage_id": 3,
  "status": "Open"
}

// Para fechamento como perdido (lost_reason obrigatório)
{
  "status": "Lost",
  "lost_reason": "Preço"
}
```

- **Comportamento:** reseta o contador de 48h (atualiza `updated_at`); aciona gatilhos de automação conforme configurado.

---

#### `GET /v1/funnel/audit`
Retorna o relatório de diagnóstico de fragilidades.

```json
// Exemplo de resposta (estrutura simplificada)
{
  "period": "2025-01-01/2025-03-31",
  "funnel": [
    { "stage": "Prospecção",  "leads": 1000, "conversion_rate": 0.60 },
    { "stage": "Qualificação", "leads": 600,  "conversion_rate": 0.45 },
    { "stage": "Negociação",  "leads": 270,  "conversion_rate": 0.55 },
    { "stage": "Fechamento",  "leads": 148,  "conversion_rate": null  }
  ],
  "bottlenecks": [
    { "stage": "Qualificação", "avg_time_hours": 96, "stagnated_leads": 87 }
  ],
  "loss_reasons": [
    { "reason": "Preço",           "count": 42, "value_lost": 189000.00 },
    { "reason": "Concorrência",    "count": 31, "value_lost": 124500.00 },
    { "reason": "Falta de Contato","count": 19, "value_lost":  76000.00 }
  ]
}
```

- **Cache:** resposta cacheada no Redis; latência P95 < 300ms.
- **Autorização:** requer JWT Scope `analytics:read`.

---

### 10.2 Webhooks de Saída

| Evento | Quando é Disparado | Uso Principal |
|---|---|---|
| `lead.stagnated` | Exatamente após 48h de inatividade em uma etapa do pipeline. | Acionar réguas de reativação; alertar gestores. |
| `lead.inactive` | Após 180+ dias sem interação (tag `is_inactive` aplicada). | Atualizar bases externas; campanhas de reengajamento de longo prazo. |
| `campaign.low_conversion` | Quando o ROI de uma campanha cai abaixo do limiar de segurança configurado. | Alertar o Gestor de Marketing para revisão da campanha. |

**Formato padrão do payload de webhook:**

```json
{
  "event": "lead.stagnated",
  "timestamp": "2025-03-15T14:32:00Z",
  "tenant_id": "tenant_abc123",
  "data": {
    "lead_id": 789,
    "opportunity_id": 456,
    "stage": "Negociação",
    "stagnated_since": "2025-03-13T14:32:00Z",
    "hours_stagnated": 48
  }
}
```

### 10.3 Integrações Externas Suportadas

| Integração | Canal | Método |
|---|---|---|
| WhatsApp Business | Automação de reativação | Webhook para API de terceiros |
| E-mail transacional | Automação de reativação | SMTP / API transacional (ex: SendGrid, SES) |
| Facebook Lead Ads | Ingestão de leads | Webhook ou importação via `POST /v1/leads/ingest` |
| Landing Pages / Formulários | Ingestão de leads | Requisição HTTP POST para `POST /v1/leads/ingest` |

> **Nota:** Qualquer ferramenta que suporte requisição HTTP POST pode integrar com o sistema via endpoint de ingestão.

---

## 11. Modelo de Dados

O modelo é estruturado para garantir **rastreabilidade completa** da origem do lead até o resultado final.

> 📊 **Diagrama visual:** https://dbdiagram.io/d/SalesWeakness-69acb3c0a3f0aa31e12a4869

### 11.1 Diagrama Textual de Relacionamentos

```
campaigns ──(1:N)──► leads ──(1:1)──► contacts
                      │
                      └──(1:N)──► opportunities ──(N:1)──► stages
                                       │
                                       └──(1:N)──► audit_logs
```

### 11.2 Definição das Entidades (DBML)

```dbml
Table campaigns {
  id          integer    [primary key]
  name        varchar    // Nome da campanha
  budget      decimal    // Budget investido
  status      varchar    // Status da campanha
  created_at  timestamp
}

Table leads {
  id          integer    [primary key]
  campaign_id integer    [ref: > campaigns.id]  // Many-to-One
  first_name  varchar
  last_name   varchar
  email       varchar
  source      varchar    // Ex: facebook_leads, landing_page
  is_inactive boolean    [default: false]        // RF03 — inatividade de longo prazo
  created_at  timestamp
  updated_at  timestamp
}

Table contacts {
  id          integer    [primary key]
  lead_id     integer    [unique, ref: - leads.id]  // One-to-One
  phone       varchar
  linkedin_url varchar
}

Table stages {
  id                  integer  [primary key]
  name                varchar  // Ex: Prospecção, Qualificação, Negociação
  order_position      integer  // Ordem no funil
  probability_percent integer  // Probabilidade de fechamento (%)
}

Table opportunities {
  id                  integer  [primary key]
  lead_id             integer  [ref: > leads.id]    // Many-to-One
  stage_id            integer  [ref: > stages.id]   // Many-to-One
  value               decimal  // Valor estimado da oportunidade
  status              varchar  // Open | Won | Lost
  lost_reason         varchar  // Obrigatório quando status = Lost (RF04)
  expected_close_date date
  updated_at          timestamp // Monitorado para detecção de estagnação (48h)
}

Table audit_logs {
  id              integer    [primary key]
  opportunity_id  integer    [ref: > opportunities.id]
  weakness_type   varchar    // Ex: Stagnation | Low_Conversion
  description     text
  created_at      timestamp
}
```

### 11.3 Relacionamentos

| Relação | Cardinalidade | Descrição |
|---|---|---|
| `campaigns` → `leads` | 1:N | Uma campanha gera múltiplos leads. |
| `leads` → `contacts` | 1:1 | Cada lead possui exatamente um contato complementar. |
| `leads` → `opportunities` | 1:N | Um lead pode ter múltiplas oportunidades ao longo do tempo. |
| `stages` → `opportunities` | 1:N | Uma etapa pode conter múltiplas oportunidades. |
| `opportunities` → `audit_logs` | 1:N | Cada oportunidade pode gerar múltiplos registros de auditoria. |

### 11.4 Campos Críticos para o Motor de Diagnóstico

| Campo | Entidade | Por que é crítico |
|---|---|---|
| `updated_at` | `opportunities` | Monitorado pelo Worker para detectar estagnação após 48h. |
| `is_inactive` | `leads` | Flag de inatividade de longo prazo (180+ dias). |
| `lost_reason` | `opportunities` | Obrigatório para alimentar relatórios de fragilidade. |
| `weakness_type` | `audit_logs` | Classificação do tipo de falha detectada. |
| `source` | `leads` | Rastreabilidade de canal para análise de qualidade. |
| `campaign_id` | `leads` | Vínculo entre lead e campanha para cálculo de ROI. |

---

## 12. Regras de Negócio

| Código | Regra | Implementação |
|---|---|---|
| **RN01** | Qualquer oportunidade com status `Open` sem atualização de `updated_at` por 48h consecutivas deve ser marcada como Estagnada. | Worker Cron Job + campo `updated_at` em `opportunities`. |
| **RN02** | A API `/v1/leads/ingest` realiza apenas registro do lead. Nenhuma distribuição automática (round robin) ocorre durante a ingestão. | Lógica de ingestão sem triggers de distribuição. |
| **RN03** | Leads sem interação por 180+ dias recebem `is_inactive = true`. O dado **não é deletado**. | Worker automatizado + soft-delete via flag booleana. |
| **RN04** | O fechamento de uma oportunidade como `Lost` exige preenchimento obrigatório de `lost_reason`. A operação é bloqueada sem esse campo. | Validação na camada de API (middleware) e constraint no banco. |
| **RN05** | Nenhuma query deve retornar dados de um tenant diferente do usuário autenticado. | Row Level Security (RLS) no PostgreSQL, ativo em todas as tabelas. |
| **RN06** | Todas as respostas de `GET /v1/funnel/audit` devem ter latência P95 inferior a 300ms. | Cache Redis com TTL + queries com CTEs otimizadas. |
| **RN07** | Todo lead ingerido deve ter `source` e `campaign_id` registrados. | Validação obrigatória na API de ingestão. |
| **RN08** | Registros em `audit_logs` são imutáveis após criação (sem UPDATE ou DELETE). | Permissões INSERT-only na tabela via RLS. |

---

## 13. Casos de Uso Priorizados

### 13.1 Estratégia de Priorização

A priorização segue a estratégia **High Risk First (Fail Fast)**: os casos de uso com maior complexidade técnica e maior valor de negócio são atacados primeiro, minimizando riscos ao longo do projeto.

### 13.2 Matriz de Esforço × Valor

| Prioridade | Caso de Uso | Complexidade Técnica | Valor de Negócio |
|---|---|---|---|
| **1º — Crítico** | UC06 — Detecção de Leads Estagnados | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **2º — Crítico** | UC01 — Autenticação e Isolamento Multi-tenant (RLS) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **3º — Crítico** | UC08 — Relatório de Auditoria de Funil | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **4º — Estratégico** | UC09 — Disparo de Régua de Reativação | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **5º — Estratégico** | UC03 — Ingestão de Leads via API Externa | ⭐⭐⭐ | ⭐⭐⭐ |
| **6º — Estratégico** | UC10 — Notificação de Baixa Performance via Webhook | ⭐⭐⭐ | ⭐⭐⭐ |
| **7º — Operacional** | UC04/UC05 — Movimentação de Pipeline (Kanban) | ⭐⭐ | ⭐⭐⭐⭐ |
| **8º — Operacional** | UC07 — Classificação de Motivo de Perda | ⭐ | ⭐⭐⭐⭐ |
| **9º — Suporte** | UC02 — Provisionamento de Módulos via Feature Flag | ⭐ | ⭐⭐⭐ |
| **10º — Suporte** | UC11/12/13 — Dashboards por Perfil | ⭐⭐⭐ | ⭐⭐⭐⭐ |

### 13.3 Casos de Uso Detalhados — Nível Crítico

---

#### UC06 — Detectar Leads Estagnados (Bottleneck Detection)

**Ator:** Sistema (Worker automatizado)  
**Objetivo:** Identificar automaticamente leads sem movimentação há 48h e gerar alertas de diagnóstico.

**Pré-condições:**
- Oportunidades com `status = 'Open'` existentes no banco.
- Worker configurado e em execução.

**Fluxo principal:**
1. Worker executa via Cron Job em intervalos configurados.
2. Busca oportunidades onde `status = 'Open'` e `NOW() - updated_at >= 48h`.
3. Para cada oportunidade encontrada:
   - Gera registro em `audit_logs` com `weakness_type = 'Stagnation'`.
   - Dispara evento `lead.stagnated` via webhook assíncrono.
4. Relatório de log da execução é registrado para monitoramento.

**Pós-condições:**
- Registros de auditoria criados.
- Webhooks enfileirados para disparo.

---

#### UC01 — Autenticar e Isolar Acesso (Multi-tenant / RLS)

**Ator:** Todos os usuários  
**Objetivo:** Garantir que cada usuário acesse apenas os dados do seu tenant, dentro dos escopos de permissão do seu perfil.

**Pré-condições:**
- Usuário com credenciais válidas cadastradas no sistema.
- RLS configurado e ativo em todas as tabelas.

**Fluxo principal:**
1. Usuário autentica via credenciais.
2. Sistema emite JWT com `tenant_id`, `user_id` e `scopes` definidos pelo perfil.
3. Em cada requisição, o API Gateway valida o JWT e injeta o contexto de tenant.
4. O PostgreSQL aplica RLS automaticamente, filtrando todas as queries pelo `tenant_id`.

**Pós-condições:**
- Nenhuma query retorna dados de outro tenant.
- Tentativas de acesso indevido resultam em erro 403.

---

#### UC08 — Gerar Relatório de Auditoria de Funil

**Ator:** Diretor Comercial  
**Objetivo:** Obter visão completa das fragilidades do funil de vendas.

**Pré-condições:**
- Usuário autenticado com JWT Scope `analytics:read`.
- Ao menos uma campanha com oportunidades registradas no período.

**Fluxo principal:**
1. Diretor acessa `GET /v1/funnel/audit` com filtros de período e/ou campanha.
2. Sistema verifica cache Redis:
   - **Cache hit:** retorna resultado em < 50ms.
   - **Cache miss:** executa queries com CTEs, calcula métricas e armazena resultado no Redis.
3. Resposta inclui: taxas de conversão por etapa, gargalos, custo da ineficiência e ROI por campanha.

**Pós-condições:**
- Nenhuma escrita no banco. Leitura de dados agregados apenas.
- Resultado cacheado para requisições subsequentes.

---

#### UC09 — Disparar Régua de Reativação

**Ator:** Sistema (triggered por `lead.stagnated`)  
**Objetivo:** Executar ação automatizada de recuperação de lead estagnado.

**Pré-condições:**
- Evento `lead.stagnated` recebido na fila de mensageria.
- Régua de reativação configurada para o estágio do lead.

**Fluxo principal:**
1. Worker consome evento `lead.stagnated` da fila.
2. Sistema verifica qual régua se aplica ao lead (por estágio, campanha ou configuração do tenant).
3. Prepara payload da mensagem (e-mail ou WhatsApp) com dados do lead.
4. Enfileira disparo na API externa correspondente.
5. Registra histórico do disparo vinculado ao lead (consultável no Dashboard do SDR).
6. Em caso de falha: aplica retry logic com backoff exponencial (máximo 3 tentativas).

---

#### UC03 — Ingerir Leads via API Externa

**Ator:** Sistema externo (formulário, plataforma de anúncios)  
**Objetivo:** Centralizar a entrada de leads no SalesWeakness de forma resiliente e auditável.

**Pré-condições:**
- Chave de API válida do tenant.
- Payload com campos obrigatórios: `email`, `source`, `campaign_id`.

**Fluxo principal:**
1. Sistema externo envia `POST /v1/leads/ingest` com payload do lead.
2. API valida autenticação e campos obrigatórios.
3. Sistema verifica duplicidade por e-mail dentro do tenant.
   - **Duplicata:** retorna `409 Conflict` com ID do lead existente.
   - **Novo:** persiste lead e contato no banco.
4. Retorna `201 Created` com `lead_id` gerado.

---

## 14. KPIs e Métricas

### 14.1 KPIs de Performance do Produto

| KPI | Meta | Como é Medido |
|---|---|---|
| **Lead Response Time** | Redução de 15% no tempo médio de primeiro contato. | `leads.created_at` vs. primeira atualização de `opportunities.updated_at`. |
| **Taxa de Recuperação de Leads** | +10% na conversão de leads recuperados por réguas. | Percentual de leads `stagnated` que voltaram ao fluxo ativo. |
| **Throughput de Webhooks** | 10.000 webhooks/hora com erro < 1%. | Monitoramento de fila de mensageria e logs de disparo. |
| **Latência da API de Analytics** | P95 < 300ms para `GET /v1/funnel/audit`. | APM nas requisições ao endpoint. |
| **Volume de Auditoria** | Quantidade de fragilidades identificadas por campanha/mês. | Contagem de registros em `audit_logs` por `campaign_id`. |

### 14.2 KPIs de Diagnóstico Gerados pela Plataforma

Estes KPIs são produzidos pelo SalesWeakness para seus usuários:

- **Taxa de conversão por etapa do funil.**
- **Tempo médio de permanência de leads por etapa.**
- **Ranking de motivos de perda** por campanha e período.
- **ROI por campanha** (receita vs. budget).
- **Taxa de leads estagnados** por campanha e por vendedor.
- **Velocidade de primeiro contato** (responsividade comercial).
- **Percentual de leads ingeridos** que avançaram para Qualificação.

---

## 15. User Stories (Backlog)

| ID | Persona | User Story | Critério de Aceitação |
|---|---|---|---|
| US01 | Diretor Comercial | Como Gestor Comercial, quero receber alerta quando a taxa de conversão de uma etapa cair 20%, para intervir antes do fechamento do mês. | Alerta gerado ao detectar queda ≥ 20% na conversão de qualquer etapa. |
| US02 | Gestor de Marketing | Como Gestor de Marketing, quero visualizar a velocidade de primeiro contato por campanha, para provar que os leads entregues são qualificados. | Dashboard exibe tempo médio entre ingestão e 1º contato, por campanha e fonte. |
| US03 | Gestor de Marketing | Como Gestor de Marketing, quero exportar o relatório de qualidade de leads em CSV, para apresentar ao time comercial. | Exportação CSV gerada de forma assíncrona, sem bloquear a interface. |
| US04 | SDR / Vendedor | Como Vendedor, quero que o sistema envie e-mail automático após 2h de inatividade de um novo lead, para não perder o timing por esquecimento. | Régua disparada dentro de 2h após detecção de inatividade do lead recém-ingerido. |
| US05 | SDR / Vendedor | Como Vendedor, quero ver o histórico de mensagens automáticas enviadas ao lead antes de entrar em contato. | Dashboard exibe lista de automações disparadas por lead, com timestamp e canal. |
| US06 | Analista de BI | Como Analista de BI, quero que leads antigos sejam marcados como inativos em vez de deletados, para preservar o histórico de ROI das campanhas. | Campo `is_inactive = true` após 180 dias; dado permanece no banco. |
| US07 | Desenvolvedor | Como Desenvolvedor, quero integrar qualquer formulário do meu site via Webhook, para que a ingestão seja centralizada e auditável. | `POST /v1/leads/ingest` aceita payloads variados e registra `source` e `campaign_id` corretamente. |

---

## 16. Definição de Pronto (Definition of Done)

Uma entrega só é considerada concluída quando **todos** os critérios abaixo são atendidos:

- [ ] **Peer Review:** código revisado e aprovado por ao menos outro membro do squad.
- [ ] **Cobertura de Testes:** testes unitários com cobertura superior a **80%** das linhas de código.
- [ ] **Documentação de API:** endpoints novos ou modificados documentados no **Swagger / OpenAPI 3.0**.
- [ ] **Pipeline CI/CD:** pipeline de integração contínua aprovado (Lint, Testes, Build).
- [ ] **Logs de Auditoria:** todas as alterações de status de oportunidade geram entrada correta em `audit_logs`.
- [ ] **Isolamento Validado:** RLS verificado — nenhuma query retorna dados de outro tenant nos testes de integração.

---

## 17. Escopo Negativo — O que NÃO está no MVP

Para garantir entrega ágil e focada na proposta de valor inicial, a **versão 1.0** não contemplará:

- ❌ **Envio nativo de SMS ou chamadas de voz** — apenas webhooks para integração com ferramentas de terceiros.
- ❌ **Aplicativo mobile nativo (iOS/Android)** — o foco é interface web 100% responsiva.
- ❌ **Integração bidirecional de caixa de entrada de e-mail** — o foco é automação de saída e alertas.
- ❌ **Funcionalidades de LGPD (anonimização/Right to be Forgotten)** — planejadas para versões futuras.
- ❌ **Distribuição automática de leads (Round Robin)** — a ingestão é passiva; a atribuição é decidida externamente.
- ❌ **Scoring preditivo de leads com IA** — identificado como evolução pós-MVP.

---

## 18. Roadmap e Possíveis Evoluções

### 18.1 MVP — Produto Mínimo Viável

Concentra-se nos componentes críticos que entregam o diferencial do produto:

1. **UC01** — Autenticação multi-tenant com RLS: fundação de segurança obrigatória para SaaS.
2. **UC06** — Detecção de Leads Estagnados (48h): coração do sistema, prova o diferencial competitivo.
3. **UC08** — Relatório de Auditoria de Funil: entrega o valor principal ao Diretor Comercial.
4. **UC03** — Ingestão de Leads via API: permite entrada de dados e uso real do sistema.

> 💡 **Marco estratégico:** com UC01 e UC06 implementados, o produto já possui um MVP demonstrável para investidores e clientes — provando a capacidade de identificar fragilidades que ferramentas tradicionais não identificam, com segurança e rastreabilidade.

### 18.2 Versão 1.0 — Produto Completo

Extensão do MVP com casos de uso de nível estratégico e operacional:

- UC09 — Réguas de Reativação com integração WhatsApp/E-mail.
- UC10 — Notificações de baixa performance via webhook.
- UC04/UC05 — Movimentação de pipeline via Kanban.
- UC07 — Classificação obrigatória de motivo de perda.
- UC11/12/13 — Dashboards completos por perfil de usuário.
- UC02 — Provisionamento de módulos via Feature Flag.

### 18.3 Evoluções Futuras (Pós v1.0)

| Funcionalidade | Descrição |
|---|---|
| **IA / Scoring Preditivo** | Score de propensão de fechamento com base em histórico de conversão. |
| **E-mail Bidirecional** | Leitura de respostas de leads diretamente na plataforma. |
| **Aplicativo Mobile** | Extensão nativa iOS/Android para gestão de pipeline em campo. |
| **SMS e Voz** | Canais adicionais de automação além de e-mail e WhatsApp. |
| **Benchmarks de Mercado** | Comparação de KPIs do cliente com dados agregados do setor. |
| **A/B Testing de Réguas** | Testes de efetividade entre diferentes abordagens de reativação. |
| **LGPD — Conformidade Total** | Anonimização de dados pessoais e Right to be Forgotten. |

---

## 19. Glossário

| Termo | Definição |
|---|---|
| **CRM** | Customer Relationship Management — sistema de gestão de relacionamento com clientes. |
| **Funil de Vendas** | Representação das etapas que um lead percorre desde o primeiro contato até o fechamento. |
| **Gargalo (Bottleneck)** | Etapa do funil onde leads ficam presos por tempo excessivo, reduzindo a velocidade de conversão. |
| **Lead** | Potencial cliente que demonstrou interesse no produto ou serviço. |
| **Oportunidade** | Negociação ativa com um lead específico, rastreada dentro do pipeline de vendas. |
| **ROI** | Return on Investment — retorno financeiro sobre o investimento de uma campanha. |
| **RLS** | Row Level Security — funcionalidade do PostgreSQL que filtra dados por critérios de segurança, garantindo isolamento multi-tenant em nível de query SQL. |
| **Multi-tenant** | Arquitetura onde um único sistema serve múltiplos clientes (tenants) com isolamento completo de dados. |
| **JWT** | JSON Web Token — padrão de autenticação e autorização baseado em tokens assinados digitalmente. |
| **Feature Flag** | Mecanismo para habilitar ou desabilitar funcionalidades sem necessidade de novo deploy. |
| **P95** | Percentil 95 — valor abaixo do qual 95% das medições se encontram; métrica padrão para latência de API. |
| **CTE** | Common Table Expression — recurso SQL para criar subconsultas nomeadas e reutilizáveis em queries complexas de analytics. |
| **Webhook** | Mecanismo de notificação em tempo real onde um sistema envia dados para outro via requisição HTTP ao ocorrer um evento. |
| **SDR** | Sales Development Representative — profissional responsável pela prospecção e qualificação inicial de leads. |
| **LGPD** | Lei Geral de Proteção de Dados — lei brasileira (13.709/2018) que regulamenta o tratamento de dados pessoais. |
| **Retry Logic** | Mecanismo que repete automaticamente operações falhas, com intervalos crescentes (backoff exponencial). |
| **Soft Delete** | Técnica de "exclusão lógica" onde o registro não é removido do banco, mas marcado como inativo via flag. |
| **Kanban** | Método visual de gestão de tarefas/oportunidades representado por cards organizados em colunas por etapa. |

---

*Documento gerado a partir da consolidação dos seguintes artefatos do projeto: PRD v1, UseCases Expandido, PRD — Revisão Fabrício, PRD — Anotações Juliana.*
