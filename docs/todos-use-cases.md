Para um Engenheiro de Computação, essa priorização é o que chamamos de **Caminho Crítico**. Colocar o mais difícil e importante no topo garante que os maiores riscos técnicos e de negócio sejam resolvidos logo no início do projeto (estratégia *Fail Fast* ou *High Risk First*).

Aqui está a lista organizada do **Core Competitivo** (Difícil/Vital) para o **Operacional Comum** (Fácil/Acessório):

---

### 1. Nível Crítico: O Diferencial e a Fundação

*Estes definem se o SalesWeakness sobrevive como produto e se é seguro.*

* **UC06: Detectar Leads Estagnados (Bottleneck Detection)**
* **Por que:** É o coração do seu software. Tecnologicamente é difícil porque exige processamento em segundo plano (Workers/Cron), comparação de janelas de tempo e lógica de agregação que não pode travar o banco.


* **UC01: Autenticar e Isolar Acesso (Multi-tenant/RLS)**
* **Por que:** Sem isso, você não tem um produto SaaS. É tecnicamente complexo garantir que o dado da Empresa A nunca vaze para a Empresa B no nível da query SQL (usando Row Level Security).


* **UC08: Gerar Relatório de Auditoria de Funil**
* **Por que:** É onde o Diretor (sua Persona Primária) vê o valor. Exige queries de analytics complexas (CTE's, cálculos de médias móveis e taxas de conversão entre etapas) que precisam rodar abaixo de 300ms.



---

### 2. Nível Estratégico: Ação e Conectividade

*Onde o sistema deixa de ser um "visualizador" e passa a ser uma "ferramenta de solução".*

* **UC09: Disparar Régua de Reativação**
* **Por que:** Resolve a "fraqueza" detectada. Exige integração com APIs externas (WhatsApp/Email), gestão de filas (Message Queue como RabbitMQ ou Redis) e controle de retentativa (retry logic).


* **UC03: Ingerir Leads via API Externa**
* **Por que:** Se o dado não entra, o sistema não audita. É difícil devido à necessidade de ser resiliente a falhas, tratar *payloads* diferentes de diversas fontes e evitar duplicidade de leads.


* **UC10: Notificar Baixa Performance via Webhook**
* **Por que:** Mantém o Gestor de Tráfego no loop. Exige a criação de um sistema de disparo de eventos assíncronos.



---

### 3. Nível Operacional: Gestão e Interface

*Funcionalidades essenciais, mas que seguem padrões de mercado (CRUDs).*

## UC11 — Visualizar Dashboard do Diretor Comercial (O Estrategista)
 
**Ator Principal:** Diretor Comercial  
**Objetivo:** Ter uma visão macro do funil de vendas para identificar onde a equipe está perdendo dinheiro e qual o "custo da ineficiência".
 
### Pré-condições
- Usuário autenticado com perfil `director` (JWT Scope: `analytics:read`).
- Ao menos uma campanha ativa com oportunidades registradas no período selecionado.
 
### Fluxo Principal
1. O Diretor acessa a rota `/dashboard/director`.
2. O sistema carrega os agregados de funil via `GET /v1/funnel/audit` (cache Redis, P95 < 300ms).
3. São exibidos os seguintes widgets:
   - **Funil de Conversão Geral:** taxa de conversão entre cada etapa (Prospecção → Qualificação → Negociação → Fechamento).
   - **Custo da Ineficiência:** valor total em oportunidades perdidas no período, agrupado por motivo de perda (`audit_logs.weakness_type`).
   - **ROI por Campanha:** receita gerada vs. budget investido por campanha (`campaigns.budget`).
   - **Ranking de Gargalos:** etapas com maior tempo médio de permanência de leads.
4. O Diretor pode filtrar por período, campanha ou vendedor responsável.
5. Ao clicar em um gargalo, o sistema navega para o relatório de auditoria (UC08).
 
### Fluxos Alternativos
- **Sem dados no período:** exibe estado vazio com mensagem orientativa e link para importar leads (UC03).
 
### Pós-condições
- Nenhuma escrita no banco. Apenas leitura de dados agregados.
 
### Requisitos Não-Funcionais
- Queries de analytics devem usar CTEs e cache Redis para garantir latência P95 < 300ms.
- Os dados devem ser isolados por tenant (RLS ativo).
 
---
 
## UC12 — Visualizar Dashboard do Gestor de Tráfego/Marketing (O Fornecedor)
 
**Ator Principal:** Gestor de Tráfego / Marketing  
**Objetivo:** Provar que os leads entregues são qualificados e identificar se a fraqueza está na abordagem comercial pós-clique, não na campanha.
 
### Pré-condições
- Usuário autenticado com perfil `marketing_manager` (JWT Scope: `campaigns:read`, `leads:read`).
- Leads ingeridos via `POST /v1/leads/ingest` com `source` e `campaign_id` preenchidos.
 
### Fluxo Principal
1. O Gestor acessa a rota `/dashboard/marketing`.
2. O sistema carrega os dados de performance de campanha.
3. São exibidos os seguintes widgets:
   - **Qualidade dos Leads por Fonte:** taxa de avanço de leads da etapa "Prospecção" para "Qualificação", agrupada por `leads.source` (ex: Facebook Leads, Landing Page).
   - **Velocidade de Primeiro Contato:** tempo médio entre a ingestão do lead (`leads.created_at`) e a primeira movimentação no pipeline — métrica que evidencia falha comercial, não de marketing.
   - **Taxa de Estagnação por Campanha:** percentual de leads estagnados (evento `lead.stagnated`) por campanha, identificando se o problema é volume ou qualidade.
   - **Alertas de Baixa Performance:** lista de campanhas que dispararam o webhook `campaign.low_conversion`, com o ROI atual vs. limiar configurado.
4. O Gestor pode exportar o relatório de qualidade de leads em CSV para apresentar ao time comercial.
 
### Fluxos Alternativos
- **Campanha sem leads ingeridos:** widget exibe aviso de que a fonte não está conectada, com link para configurar o webhook de ingestão.
 
### Pós-condições
- Log de acesso ao relatório registrado (auditoria de visualização, não de dados).
 
### Requisitos Não-Funcionais
- A separação "falha de marketing vs. falha comercial" deve ser visualmente clara — é o argumento central desta persona.
- Exportação CSV deve ser gerada de forma assíncrona para não bloquear a UI em grandes volumes.
 
---
 
## UC13 — Visualizar Dashboard do SDR/Vendedor (O Executor)
 
**Ator Principal:** SDR / Vendedor  
**Objetivo:** Ter visibilidade das suas próprias oportunidades, priorizar ações e não deixar leads esfriarem por esquecimento.
 
### Pré-condições
- Usuário autenticado com perfil `sales_rep` (JWT Scope: `deals:read`, `deals:write`).
- Oportunidades atribuídas ao vendedor logado.
 
### Fluxo Principal
1. O Vendedor acessa a rota `/dashboard/sales-rep`.
2. O sistema carrega apenas as oportunidades do vendedor logado (RLS garante isolamento por usuário).
3. São exibidos os seguintes widgets:
   - **Meu Pipeline:** visão Kanban das oportunidades por etapa, com indicador visual de urgência para leads estagnados (ex: borda vermelha após 48h parado).
   - **Fila de Ação Imediata:** lista priorizada de leads que requerem ação — ordenada por tempo de inatividade e probabilidade de fechamento (`stages.probability_percent`).
   - **Próximas Datas de Fechamento:** oportunidades com `expected_close_date` nos próximos 7 dias.
   - **Histórico de Réguas Disparadas:** e-mails/WhatsApps enviados automaticamente (UC09) para cada lead, para o vendedor saber o que o lead já recebeu antes de entrar em contato.
4. O Vendedor pode mover um card de etapa diretamente pelo Kanban (aciona UC04/UC05).
5. Ao fechar uma oportunidade como perdida, o sistema obriga o preenchimento do motivo (UC07).
 
### Fluxos Alternativos
- **Sem oportunidades ativas:** exibe estado vazio com botão para criar nova oportunidade manualmente ou aguardar ingestão automática.
 
### Pós-condições
- Movimentações de card geram entrada em `audit_logs` com `weakness_type` correspondente.
- Alterações de status acionam gatilhos de automação conforme configurado (UC09).
 
### Requisitos Não-Funcionais
- O Kanban deve atualizar em tempo real (WebSocket ou polling curto) para refletir leads recém-estagnados sem necessidade de recarregar a página.
- A carga inicial do dashboard deve priorizar a "Fila de Ação Imediata" para reduzir o tempo até a primeira ação do vendedor.

* **UC04/UC05: Movimentação de Pipeline e Conversão**
* **Por que:** É o comportamento padrão de qualquer CRM (arrastar card). Importante para o fluxo, mas tecnicamente simples (Update no banco).


* **UC07: Classificar Motivo da Perda**
* **Por que:** Regra de negócio importante para o relatório, mas tecnicamente é apenas uma validação de campo obrigatório no fechamento da oportunidade.



---

### 4. Nível de Suporte: Configuração

*Facilitadores de escala e vendas.*

* **UC02: Provisionar Módulos via Feature Flag**
* **Por que:** Importante para o modelo comercial (Upsell), mas tecnicamente fácil de implementar com bibliotecas prontas ou uma tabela simples de permissões no banco.



---

### Matriz de Esforço x Valor

| Prioridade | Caso de Uso | Complexidade Técnica | Valor de Negócio |
| --- | --- | --- | --- |
| **1º** | UC06 (Detecção de Gargalo) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **2º** | UC01 (Segurança/RLS) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **3º** | UC08 (Relatório de Auditoria) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **4º** | UC09 (Automação/Mensageria) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **5º** | UC03 (Ingestão/API) | ⭐⭐⭐ | ⭐⭐⭐ |

**Dica de mestre:** Se você resolver o **UC01** e o **UC06** primeiro, você já tem um "MVP (Mínimo Produto Viável) Matador" que pode ser demonstrado para investidores ou clientes, pois você provou que consegue identificar o que ninguém mais identifica com segurança.

**Gostaria que eu montasse agora um "Cronograma de Sprints" sugerindo quais dessas tarefas você deve atacar nas primeiras 4 semanas de desenvolvimento?**