Excelente, agora a brincadeira ficou séria! Para um Engenheiro de Computação, transformar uma PRD em tarefas granulares é o que separa um "projeto de final de semana" de um software escalável.

Dividi o **SalesWeakness** em módulos lógicos. Pense neles como microserviços ou namespaces isolados que, juntos, formam a engrenagem completa.

---

## 🏗️ Fase 1: Fundação e Infraestrutura (O "Core")

*Esta é a base para o Multi-tenant e a segurança citada no RNF.*

* [ ] **Setup de Banco de Dados:** Criar schema PostgreSQL com suporte a Row Level Security (RLS) para isolamento de dados.
* [ ] **Módulo de Autenticação:** Implementar JWT com suporte a *Scopes* (Permissões) para liberar módulos individualmente.
* [ ] **Sistema de Feature Flags:** Criar ou integrar ferramenta para habilitar/desabilitar funcionalidades em tempo real por cliente.
* [ ] **Camada de Cache:** Configurar Redis para armazenar agregados de dashboards e evitar queries pesadas no banco.
* [ ] **Pipeline de CI/CD:** Configurar GitHub Actions/GitLab CI com jobs de Lint e Testes Automatizados.

## 📥 Fase 2: Módulo de Ingestão e CRM (Os Dados Brutos)

*Responsável por alimentar o sistema.*

* [ ] **Endpoint `POST /v1/leads/ingest`:** Desenvolver o "estômago" do sistema para receber dados de diversas fontes.
* [ ] **Lógica de Conversão Lead → Contact:** Implementar a trigger que transforma um lead qualificado em contato (1:1).
* [ ] **Gestão de Campanhas:** CRUD para criação e controle de orçamento das campanhas.
* [ ] **Motor de Pipeline:** Implementar a lógica de estágios (Stages) e movimentação de oportunidades.
* [ ] **Histórico de Auditoria:** Criar o sistema que loga toda mudança de status (essencial para o cálculo de tempo de permanência).

## 🧠 Fase 3: O "Cérebro" (Algoritmos de Diagnóstico)

*Aqui é onde o SalesWeakness se diferencia de um CRM comum (RF01).*

* [ ] **Worker de Detecção de Estagnação:** Script de background que roda a cada X horas identificando leads parados.
* [ ] **Cálculo de Lead Time Médio:** Algoritmo que calcula quanto tempo cada lead leva em cada etapa por campanha.
* [ ] **Endpoint `GET /v1/funnel/audit`:** Implementar a agregação de dados que gera o relatório de fragilidades.
* [ ] **Engine de Atribuição de Perda:** Lógica para obrigar e validar o preenchimento do "Motivo da Perda" no fechamento da oportunidade.

## ⚡ Fase 4: Automação e Mensageria (RF02)

*A parte que "conserta" a fragilidade automaticamente.*

* [ ] **Sistema de Webhooks Saída:** Desenvolver o disparador de eventos para sistemas externos (`lead.stagnated`).
* [ ] **Integração com Provedores de Mensagem:** Criar adaptadores para APIs de E-mail (SendGrid/Mailchimp) e WhatsApp.
* [ ] **Régua de Reativação:** Criar o motor de regras que decide: "Se lead está parado há 2h na etapa X, dispare e-mail Y".

## 📊 Fase 5: Dashboards e Personas (A Entrega de Valor)

*Visualização de dados focada em cada usuário.*

* [ ] **Dashboard "Visão do Diretor":** Interface com foco em ROI perdido e custo de ineficiência.
* [ ] **Relatório de Performance de Campanha:** Visão para o Gestor de Tráfego comparar qualidade de leads vs. conversão real.
* [ ] **Interface do Vendedor:** Lista priorizada de leads (quentes vs. frios) para mitigar a falha humana.

## 🛠️ Fase 6: Documentação e DoD Final

* [ ] **Swagger/OpenAPI:** Gerar a documentação técnica interativa de todos os endpoints.
* [ ] **Suíte de Testes de Carga:** Simular o RNF de performance (P95 < 300ms) sob estresse.
* [ ] **Manual de Integração:** Documento rápido de como configurar o Webhook para desenvolvedores externos.

---

### Dica de Engenharia:

Para o **RF01 (Identificação de Gargalos)**, não tente calcular tudo em tempo real toda vez que o usuário abrir o gráfico. Use um padrão de **Materialized Views** ou um worker que atualize os dados agregados no Redis a cada 15 minutos. Isso vai garantir que seu RNF de performance (300ms) seja batido com folga!

**Como você é da Engenharia, gostaria que eu focasse agora na lógica de um desses sistemas específicos? (Ex: Como estruturar o RLS no banco ou a lógica do Worker de estagnação?)**