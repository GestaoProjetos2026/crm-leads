1. **Visão Geral**

   O **SalesWeakness** é uma plataforma integrada de CRM e Automação de Marketing focada em **diagnóstico de performance**. Diferente de ferramentas tradicionais que apenas registram dados, o SalesWeakness atua como um "auditor" do funil de vendas, rastreando cada etapa da jornada do cliente para identificar gargalos, falhas de execução e oportunidades perdidas em campanhas de marketing e processos comerciais.

2. **Proposta de Valor**

   Transformamos dados brutos em inteligência acionável. O SalesWeakness não apenas diz _quanto_ você vendeu, mas aponta exatamente _por que_ você não vendeu mais, revelando as fragilidades ocultas que corroem o _Return on Investment _(ROI) das suas campanhas.

3. **Personas**

   * **Persona Primária: Diretor Comercial (O Estrategista)** – Precisa de uma visão macro para entender onde a equipe está perdendo dinheiro e qual o "custo da ineficiência".

   * **Persona Secundária: Gestor de Tráfego/Marketing (O Fornecedor)** – Quer provar que os leads são qualificados e identificar se a "fragilidade" está na abordagem comercial pós-clique.

   * **Persona Operacional: SDR/Vendedor (O Executor)** – Precisa de automação para não deixar leads esfriarem, mitigando a falha humana.

4. **Requisitos Funcionais (RF)**

   * **RF01: Algoritmo de Identificação de Gargalos (Bottleneck Detection)** – O sistema deve analisar o tempo médio de conversão entre etapas e sinalizar automaticamente quando um lead excede o tempo limite de permanência em um estágio (ex: "Lead parado há 48h em Negociação").

   * **RF02: Automação de Recuperação de Leads** – O módulo deve permitir a criação de réguas de automação (e-mail/WhatsApp) baseadas no status da oportunidade, visando "reativar" fragilidades detectadas.

   * **RF03: Dashboard de Atribuição de Perda** – O sistema deve exigir a classificação do motivo da perda (Ex: Preço, Concorrência, Falta de Contato) para gerar o relatório de "Fraquezas da Campanha".

5. **Requisitos Não-Funcionais (RNF)**

   * **Segurança (Isolamento):** Utilização de arquitetura **Multi-tenant** com isolamento lógico via _Row Level Security_ (RLS) no banco de dados. Cada módulo contratado individualmente é liberado via _Feature Flags_ e JWT Scopes.

   * **Performance:** A API deve responder a consultas de analytics com latência inferior a **300ms** para 95% das requisições (P95), utilizando cache (Redis) para agregados de funil.

   * **Escalabilidade:** Arquitetura baseada em microserviços ou containers (Docker/K8s) para suportar picos de carga durante grandes campanhas (ex: Black Friday) sem degradação do serviço.

6. **Especificação Técnica e Integração (Essencial para Eng. Comp.)**

   #### Endpoints de API (Exemplos)

   * `POST /v1/leads/ingest` – Recebe leads de fontes externas (Facebook Leads, Landing Pages).

   * `GET /v1/funnel/audit` – Retorna o relatório de fragilidades com base em KPIs de conversão.

   * `PATCH /v1/deals/{id}/status` – Atualiza o estágio da venda e aciona gatilhos de automação.

   #### Webhooks

   * `lead.stagnated`: Disparado quando um lead para em uma etapa por mais tempo que o configurado.

   * `campaign.low_conversion`: Disparado quando o ROI de uma campanha cai abaixo do limiar de segurança.

   #### Diagrama de Dados (Modelagem Simplificada)

   O foco aqui é a rastreabilidade da origem até a perda/ganho.\
   \
   <https://dbdiagram.io/d/SalesWeakness-69acb3c0a3f0aa31e12a4869>

   ![7440c45b-42ed-47c3-b9e2-780abb84fd2e](/docs/Banco_de_dados_v0.0.png)

   ```
   // Use este código no dbdiagram.io para gerar seu diagrama visual

   Table campaigns {
     id integer [primary key]
     name varchar
     budget decimal
     status varchar
     created_at timestamp
   }

   Table leads {
     id integer [primary key]
     campaign_id integer [ref: > campaigns.id] // Relacionamento Many-to-One
     first_name varchar
     last_name varchar
     email varchar
     source varchar
     created_at timestamp
   }

   Table contacts {
     id integer [primary key]
     lead_id integer [unique, ref: - leads.id] // Relacionamento One-to-One
     phone varchar
     job_title varchar
     linkedin_url varchar
   }

   Table stages {
     id integer [primary key]
     name varchar // Ex: Prospecção, Qualificação, Negociação
     order_position integer
     probability_percent integer
   }

   Table opportunities {
     id integer [primary key]
     lead_id integer [ref: > leads.id]
     stage_id integer [ref: > stages.id]
     title varchar
     value decimal
     expected_close_date date
     status varchar // Open, Won, Lost
   }

   Table audit_logs {
     id integer [primary key]
     opportunity_id integer [ref: > opportunities.id]
     weakness_type varchar // Ex: "Stagnation", "Low Engagement"
     description text
     created_at timestamp
   }

   // Definição explícita de relacionamentos (opcional, já definidos acima inline)
   // Ref: campaigns.id < leads.campaign_id
   // Ref: leads.id - contacts.lead_id
   // Ref: leads.id < opportunities.lead_id
   // Ref: stages.id < opportunities.stage_id
   // Ref: opportunities.id < audit_logs.opportunity_id
   ```

7. **Visão Geral**

   O **SalesWeakness** é uma plataforma integrada de CRM e Automação de Marketing focada em **diagnóstico de performance**. Diferente de ferramentas tradicionais que apenas registram dados, o SalesWeakness atua como um "auditor" do funil de vendas, rastreando cada etapa da jornada do cliente para identificar gargalos, falhas de execução e oportunidades perdidas em campanhas de marketing e processos comerciais.

8. **User Stories (Para o Backlog)**

   * **Como Gestor Comercial**, eu quero receber um alerta quando a taxa de conversão de uma etapa cair 20%, para que eu possa intervir na equipe antes do fechamento do mês.

   * **Como Vendedor**, eu quero que o sistema envie um e-mail automático após 2 horas de inatividade de um novo lead, para que eu não perca o _timing_ da venda por esquecimento.

   * **Como Desenvolvedor**, eu quero integrar via Webhook qualquer formulário do meu site, para que a ingestão de dados seja centralizada e auditável.

9. **Definição de Pronto (DoD)**

* [ ]

  Código revisado por outro Squad (Peer Review).

* [ ]

  Testes unitários com **>80% de cobertura**.

* [ ]

  Documentação da API atualizada (**Swagger/OpenAPI 3.0**).

* [ ]

  Pipeline de CI/CD passando (Lint, Testes, Build).

* [ ]

  Logs de auditoria implementados para todas as alterações de status de venda.
