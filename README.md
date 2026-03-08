# SalesWeakness 🔍📉

**SalesWeakness** é uma plataforma integrada de CRM e Automação de Marketing com foco central em **diagnóstico de performance e identificação de gargalos**. Diferente de ferramentas tradicionais que se limitam a registrar dados de vendas, o SalesWeakness age como um verdadeiro "auditor" do seu funil. Ele acompanha cada passo da jornada do cliente, revelando falhas de execução, oportunidades paradas e os reais motivos pelos quais você está perdendo dinheiro.

---

## 🎯 Proposta de Valor

Transformamos dados brutos de marketing e vendas em inteligência acionável. Nós não apenas dizemos o *quanto* você vendeu, nós apontamos com exatidão *por que* você não vendeu mais. Identificamos as fragilidades operacionais ocultas que corroem o Retorno sobre Investimento (ROI) de suas campanhas. Um verdadeiro seguro rotineiro contra a "perda de oportunidade" por esquecimento ou lentidão da equipe.

## 👥 Personas
O sistema atende a diferentes necessidades, mas com foco em inteligência e proatividade:
- **Diretor Comercial (O Estrategista)**: Foco em visão macro, custo da ineficiência e ROI perdido.
- **Gestor de Tráfego/Marketing (O Fornecedor)**: Comprovação da qualidade dos leads gerados e acompanhamento da conversão no pós-clique.
- **SDR / Vendedor / Closer (O Executor)**: Automação que mitiga falha humana, priorização de contato diário baseada em SLA e não perda de *timing*.
- **Engenheiro de Dados**: Consumo dos recortes estruturados de auditoria para montar relatórios de tendência de ineficiência operacional a longo prazo.

---

## 🏗️ Arquitetura e Fases de Desenvolvimento

O projeto foi decomposto seguindo uma lógica moderna de engenharia de software (microsserviços, workers, isolamento):

- **Fase 1: Fundação (Core)**: Setup do DB PostgreSQL com **Row Level Security (RLS)** garantindo total isolamento *Multi-Tenant*. JWT scopes, Feature Flags, camada em Redis para agregações e pipeline CI/CD.
- **Fase 2: Módulo Ingestão e CRM**: Endpoints de ingestão rápida (`/v1/leads/ingest`), controle de campanha e CRUD básico do funil. 
- **Fase 3: O Cérebro (Diagnóstico)**: Onde a mágica acontece. Algoritmos assíncronos (Workers) que detectam leads parados, tempos médios por etapas e imputação de perdas.
- **Fase 4: Automação e Mensageria**: Webhooks de saída e triggers que reativam leads esquecidos via e-mail/WhatsApp.
- **Fase 5: Dashboards**: Visualizações acionáveis e otimizadas para P95 < 300ms de latência.
- **Fase 6: Documentação**: Validação de Swagger/OpenAPI, rotinas de stress test, e *Definition of Done*.

---

## 🛣️ Entregas e Priorização

O core business adota a estratégia do **Caminho Crítico (Fail Fast)**: atacar o que é mais difícil e vital primeiro.

1. **Nível Crítico (Diferencial & Fundação):**
   - **UC06: Detectar Leads Estagnados (Bottleneck Detection):** O coração da ferramenta e foco principal desde a Sprint 1. Usa processamento de background para avaliar SLAs de inatividade.
   - **UC01: Autenticar e Isolar Acesso (RLS):** Garantia de arquitetura SaaS impenetrável.
   - **UC08: Relatório de Auditoria:** O alto valor gerado na ponta para a Persona Primária.

2. **Nível Estratégico (Ponte p/ Ação):**
   - **UC09:** Disparar Régua de Reativação; **UC03:** Ingerir Leads Externos; **UC10:** Notificações via Webhook.

3. **Nível Operacional e de Suporte (CRM Comum):**
   - Visualizações, Fluxo Kanban do CRM, Motivos de Perda e Controle de Módulos (Feature Flags).

### O "Motor de Gargalos" (Sprint 1)
O alvo imediato é montar um *Vertical Slice* (fatia completa ponta-a-ponta, porém fina) contendo o esquema do banco, ingestão básica, script/worker em background de identificação de estagnação (`WEAKNESS_STAGNATION` no Audit_Log) e resultado de saída visível para comprovar a tese de negócio rapidamente.

---

## 📚 Documentos de Referência

A pasta `/docs` contém detalhamentos riquíssimos da engenharia e produto. Acesse para referências mais aprofundadas:

* [**PRD Principal - Visão Geral**](./docs/salecrmlea-salesweakness.md) (Diagrama e Modelo Físico de Banco de Dados)
* [**Planejamento de Fases e Microsserviços**](./docs/lista-microservicos.md)
* [**Mapa de Casos de Uso (Priorizados)**](./docs/todos-use-cases.md)
* [**Estratégia de Sprint 1 (Core Risk)**](./docs/qual-fazer-primeiro.md)
* [**Detalhamento do UC06: Motor de Gargalos**](./docs/uc06-bottleneck-stagnation-engine-motor-de-gargalos.md) 
* [Imagem do Banco de Dados](./docs/Banco_de_dados_v0.0.png)

---
*Gerado a partir das definições iniciais do projeto SalesWeakness. Mantendo o foco em auditoria acionável.*
