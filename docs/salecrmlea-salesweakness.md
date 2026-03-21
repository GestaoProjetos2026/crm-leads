1. **Visão Geral**

  O **SalesWeakness** é uma plataforma de CRM e Automação de Marketing focada em diagnóstico de performance. Diferente de ferramentas tradicionais, ele atua como um "auditor" do funil de vendas, rastreando a jornada do cliente para identificar gargalos, falhas de execução e oportunidades perdidas, revelando a "fragilidade" real do processo comercial.

2. **Proposta de Valor**

   Transformamos dados brutos em inteligência acionável. O SalesWeakness aponta exatamente por que você não vendeu mais, revelando as fragilidades ocultas (como leads parados ou campanhas com baixa conversão) que corroem o ROI das operações de marketing e vendas.

3. **Personas**

   * Persona Primária: Diretor Comercial (O Estrategista) – Busca visão macro do "custo da ineficiência" e onde a equipe está perdendo dinheiro.

   * Persona Secundária: Gestor de Marketing (O Fornecedor) – Quer provar a qualidade dos leads e identificar se o problema está na abordagem comercial pós-clique.

   * Persona Operacional: SDR/Vendedor (O Executor) – Utiliza automações para evitar que leads esfriem, mitigando o esquecimento humano.

4. **Requisitos Funcionais (RF)**

   * RF01: Monitoramento de Estagnação (Regra Fixa 48h) – O sistema deve monitorar o tempo de permanência de um lead em cada etapa. Caso não haja alteração de status por 48 horas consecutivas, o lead deve ser marcado como "Estagnado" e um alerta de auditoria deve ser gerado.

   * RF02: Ingestão Passiva de Leads – O sistema deve receber leads via API apenas para registro e persistência inicial. Não deve haver distribuição automática (Round Robin) no momento da ingestão.

   * RF03: Ciclo de Vida e Tag de Inatividade – Leads sem qualquer interação por um longo período (ex: 180 dias) devem receber automaticamente a tag inactive_status. O dado não deve ser deletado, preservando o histórico para auditoria e Business Intelligence.

   * RF04: Atribuição Obrigatória de Perda – Ao marcar uma oportunidade como "Perdida", o usuário deve obrigatoriamente classificar o motivo (Preço, Concorrência, Falta de Contato) para alimentar os relatórios de fragilidade.

   * RF05: Réguas de Reativação – Automação de disparos (e-mail/WhatsApp) baseada exclusivamente na detecção de fragilidades (ex: lead estagnado).

5. **Requisitos Não-Funcionais (RNF)**

   * Segurança e Privacidade: Arquitetura Multi-tenant com isolamento via Row Level Security (RLS). Dados sensíveis devem ser protegidos e o acesso controlado por escopos de JWT.

   * Performance: A API de analytics deve responder em menos de 300ms (P95), utilizando Redis para cache de agregados do funil.

   * Escalabilidade: Implementação baseada em containers (Docker) para suportar picos de carga sem degradação do serviço.

6. **Especificação Técnica e Integração (Essencial para Eng. Comp.)**

   #### Endpoints de API (Exemplos)

   * POST /v1/leads/ingest – Registro puro de leads externos.

   * GET /v1/funnel/audit – Relatório de diagnóstico de perdas e gargalos.

   * PATCH /v1/deals/{id}/status – Atualização de estágio (reseta o contador de 48h).

   #### Webhooks

   * `lead.stagnated`: Disparado exatamente após o limite de 48h de inatividade em uma etapa.

   * `lead.inactive`: Disparado quando o lead recebe a tag de inatividade de longo prazo.

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
  campaign_id integer [ref: > campaigns.id]
  first_name varchar
  last_name varchar
  email varchar
  is_inactive boolean [default: false] // RF03
  created_at timestamp
  updated_at timestamp
}

Table contacts {
  id integer [primary key]
  lead_id integer [unique, ref: - leads.id]
  phone varchar
  linkedin_url varchar
}

Table stages {
  id integer [primary key]
  name varchar
  order_position integer
}

Table opportunities {
  id integer [primary key]
  lead_id integer [ref: > leads.id]
  stage_id integer [ref: > stages.id]
  value decimal
  status varchar // Open, Won, Lost
  lost_reason varchar // RF04
  updated_at timestamp
}

Table audit_logs {
  id integer [primary key]
  opportunity_id integer [ref: > opportunities.id]
  weakness_type varchar // Ex: "Stagnation", "Low_Conversion"
  description text
  created_at timestamp
}
   ```

7. Métricas de Sucesso (KPIs)

  * Rapidez na Identificação de Perdas: Tempo decorrido entre a estagnação do lead e a geração do log de auditoria.

  * Taxa de Recuperação de Leads: Porcentagem de leads estagnados que voltaram ao fluxo ativo após o alerta.

  * Volume de Oportunidades Auditadas: Quantidade de falhas de processo identificadas por campanha.

8. **User Stories (Para o Backlog)**

  * Como Gestor Comercial, eu quero ser notificado quando um lead atingir 48h sem movimentação, para cobrar a execução da equipe.

  * Como Desenvolvedor, eu quero que a ingestão de leads seja apenas um registro em banco, para que processos externos decidam a atribuição posteriormente.

  * Como Analista de BI, eu quero que leads antigos sejam marcados como inativos em vez de deletados, para que eu não perca o histórico de ROI das campanhas passadas.

9. **Definição de Pronto (DoD)**

* [ ]

  Peer Review realizado.

* [ ]

  Testes unitários com cobertura > 80%.

* [ ]

  Documentação da API atualizada (**Swagger/OpenAPI 3.0**).

* [ ]

  Pipeline de CI/CD aprovado.

* [ ]

  Logs de auditoria validados para cada mudança de status.
