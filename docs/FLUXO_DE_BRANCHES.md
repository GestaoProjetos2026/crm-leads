# Política de Versionamento e Fluxo de Branches

Este documento estabelece as diretrizes para o fluxo de versionamento do projeto **SalesWeakness**, definindo claramente o papel de cada branch e as regras para integração de código.

## 1. Branches Principais

### `main`
- **Propósito:** Reservada exclusivamente para versionamento estável e de entrega (produção).
- **Regras:** 
  - **NÃO** são permitidos commits diretos nesta branch.
  - O código nesta branch deve estar sempre em um estado pronto para ser implantado (deployable).
  - Atualizações na `main` ocorrem preferencialmente através de merges de branches `release/` ou `hotfix/`.

### `develop`
- **Propósito:** Branch central de desenvolvimento de trabalho contínuo.
- **Regras:**
  - Contém o código com as features mais recentes entregues para a próxima release.
  - **NÃO** são permitidos commits diretos para o desenvolvimento diário.
  - Toda nova alteração ou feature deve ser integrada à `develop` através de um **Pull Request**.

---

## 2. Padrão de Nomenclatura de Branches de Trabalho

As novas alterações devem sair de branches específicas por tarefa, partindo da branch `develop`. As branches devem seguir a convenção de nomenclatura abaixo, sempre em letras minúsculas (lowercase) e separadas por hífen (`-`):

| Prefixo | Situação de Uso | Exemplo |
| --- | --- | --- |
| `feature/` | Desenvolvimento de novas funcionalidades ou tarefas estruturais. | `feature/autenticacao-usuario`, `feature/tabela-leads` |
| `fix/` | Correção de bugs e ajustes no ambiente de desenvolvimento/teste. | `fix/erro-calculo-funil`, `fix/ajuste-layout-mobile` |
| `hotfix/` | Correção urgente em produção. São criadas a partir da `main` e integradas de volta tanto na `main` quanto na `develop`. | `hotfix/falha-login-api` |
| `release/` | Preparação para um novo ciclo de entrega. | `release/v1.2.0` |

---

## 3. Política de Pull Requests (PRs)

Para garantir a qualidade e estabilidade do código, o fluxo de desenvolvimento deve respeitar a seguinte regra de ouro:

> **Toda e qualquer alteração precisa passar por um Pull Request antes de ser incorporada na branch principal de desenvolvimento (`develop`) ou na de produção (`main`).**

### Checklist de Pull Request
1. **Revisão:** Solicitar a revisão de ao menos um outro membro do time (Code Review).
2. **Atualização:** Garantir que a branch de origem esteja sincronizada e atualizada com o código da `develop` mais recente (resolver conflitos, se houver).
3. **Padrão:** O título e a descrição do Pull Request devem explicar claramente qual problema foi resolvido ou qual funcionalidade foi implementada, referenciando a tarefa do card associado, se aplicável.
