# ADR-001 — Design System, Cores, Tipografia e Componentes

**Status:** Aceito  
**Data:** 2026-05-15  
**Contexto:** Aplicações web em estilo SaaS/dashboard, com interface escura, navegação lateral, cards de métricas, tabelas, listas operacionais e ações administrativas.  
**Base visual:** dashboards escuros com sidebar fixa, cards elevados, botões azuis, contraste entre fundo profundo e superfícies azuladas.

---

## 1. Contexto

O produto precisa de uma identidade visual consistente, moderna e profissional, adequada para sistemas como ERP, CRM, Help Desk, dashboards operacionais e plataformas internas.

A interface dos protótipos segue uma linha visual:

- Tema predominantemente escuro.
- Sidebar lateral fixa.
- Fundo principal em azul quase preto.
- Cards com superfície levemente mais clara que o fundo.
- Botões primários em azul vivo.
- Textos claros com hierarquia bem definida.
- Indicadores operacionais com cores semânticas.
- Visual limpo, técnico e com aparência de produto SaaS.

A paleta base fornecida será usada como fundação do design system.

---

## 2. Decisão

Adotaremos um **Design System dark-first**, baseado em tons de azul profundo, com destaque em azul vibrante para ações principais.

A fonte oficial será **Inter**, por ser uma fonte moderna, legível, neutra e adequada para interfaces administrativas, dashboards e produtos digitais.

A interface será organizada a partir de tokens de design, incluindo:

- Cores primitivas.
- Cores semânticas.
- Tipografia.
- Espaçamentos.
- Bordas.
- Sombras.
- Componentes reutilizáveis.
- Padrões de estado e feedback visual.

---

## 3. Paleta de Cores

### 3.1 Cores primitivas

Estas cores representam a base da identidade visual.

```css
:root {
  --smart-blue: #0466c8;
  --sapphire: #0353a4;
  --regal-navy: #023e7d;
  --prussian-blue: #002855;
  --prussian-blue-2: #001845;
  --prussian-blue-3: #001233;
  --twilight-indigo: #33415c;
  --blue-slate: #5c677d;
  --slate-grey: #7d8597;
  --lavender-grey: #979dac;
}
```

### 3.2 Uso semântico das cores

A paleta será organizada em tokens semânticos para evitar o uso direto das cores primitivas dentro dos componentes.

```css
:root {
  /* Backgrounds */
  --color-bg-app: #001233;
  --color-bg-sidebar: #001845;
  --color-bg-header: #001233;
  --color-bg-surface: #0b1328;
  --color-bg-surface-2: #101a33;
  --color-bg-surface-hover: #16213f;
  --color-bg-elevated: #111c36;

  /* Borders */
  --color-border-subtle: rgba(151, 157, 172, 0.12);
  --color-border-default: rgba(151, 157, 172, 0.20);
  --color-border-strong: rgba(151, 157, 172, 0.32);

  /* Brand */
  --color-brand-primary: #0466c8;
  --color-brand-primary-hover: #0353a4;
  --color-brand-primary-active: #023e7d;
  --color-brand-muted: rgba(4, 102, 200, 0.16);

  /* Text */
  --color-text-primary: #f8fafc;
  --color-text-secondary: #cbd5e1;
  --color-text-muted: #979dac;
  --color-text-disabled: #5c677d;
  --color-text-inverse: #001233;

  /* Icons */
  --color-icon-primary: #f8fafc;
  --color-icon-secondary: #979dac;
  --color-icon-muted: #5c677d;
  --color-icon-brand: #0466c8;
}
```

### 3.3 Cores de status

A paleta principal é azulada, mas o sistema precisa de feedback visual para estados operacionais. As cores abaixo devem ser usadas apenas para status, alertas e indicadores.

```css
:root {
  /* Success */
  --color-success: #22c55e;
  --color-success-muted: rgba(34, 197, 94, 0.14);
  --color-success-border: rgba(34, 197, 94, 0.28);

  /* Warning */
  --color-warning: #f59e0b;
  --color-warning-muted: rgba(245, 158, 11, 0.14);
  --color-warning-border: rgba(245, 158, 11, 0.28);

  /* Danger */
  --color-danger: #ef4444;
  --color-danger-muted: rgba(239, 68, 68, 0.14);
  --color-danger-border: rgba(239, 68, 68, 0.28);

  /* Info */
  --color-info: #38bdf8;
  --color-info-muted: rgba(56, 189, 248, 0.14);
  --color-info-border: rgba(56, 189, 248, 0.28);
}
```

---

## 4. Gradientes

Os gradientes devem ser usados com moderação, principalmente em:

- Logos.
- Ícones de marca.
- Cards premium.
- Headers especiais.
- Botões de destaque em telas comerciais.
- Elementos visuais de onboarding.

Não devem ser usados em excesso em dashboards operacionais para não prejudicar legibilidade.

```css
:root {
  --gradient-brand-horizontal: linear-gradient(
    90deg,
    #0466c8 0%,
    #0353a4 35%,
    #023e7d 70%,
    #001845 100%
  );

  --gradient-brand-diagonal: linear-gradient(
    135deg,
    #0466c8 0%,
    #023e7d 45%,
    #001233 100%
  );

  --gradient-surface: linear-gradient(
    180deg,
    rgba(4, 102, 200, 0.14) 0%,
    rgba(0, 18, 51, 0.04) 100%
  );
}
```

---

## 5. Tipografia

### 5.1 Fonte oficial

A fonte oficial do produto será:

```css
font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Motivos da escolha:

- Alta legibilidade em dashboards.
- Boa leitura em tamanhos pequenos.
- Aparência moderna e profissional.
- Funciona bem em interfaces densas com tabelas, menus, cards e formulários.

### 5.2 Escala tipográfica

```css
:root {
  --font-family-base: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  --font-size-xs: 0.75rem;     /* 12px */
  --font-size-sm: 0.875rem;    /* 14px */
  --font-size-md: 1rem;        /* 16px */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-size-xl: 1.25rem;     /* 20px */
  --font-size-2xl: 1.5rem;     /* 24px */
  --font-size-3xl: 1.875rem;   /* 30px */
  --font-size-4xl: 2.25rem;    /* 36px */

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.15;
  --line-height-normal: 1.45;
  --line-height-relaxed: 1.65;
}
```

### 5.3 Hierarquia de títulos

| Token | Tamanho | Peso | Line-height | Uso |
|---|---:|---:|---:|---|
| H1 | 36px | 700 | 1.15 | Título principal de página institucional ou tela inicial |
| H2 | 30px | 700 | 1.2 | Título principal de dashboard |
| H3 | 24px | 600 | 1.25 | Título de seção |
| H4 | 20px | 600 | 1.3 | Título de card ou grupo |
| H5 | 18px | 600 | 1.35 | Subtítulo ou bloco secundário |
| H6 | 16px | 600 | 1.4 | Título pequeno |

```css
h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);
}

h2 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  color: var(--color-text-primary);
}

h3 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: 1.25;
  color: var(--color-text-primary);
}

h4 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: 1.3;
  color: var(--color-text-primary);
}

h5 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: 1.35;
  color: var(--color-text-primary);
}

h6 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  line-height: 1.4;
  color: var(--color-text-primary);
}
```

### 5.4 Textos de interface

| Token | Tamanho | Peso | Uso |
|---|---:|---:|---|
| Display | 36px | 700 | Destaques raros, landing pages e hero |
| Page title | 30px | 700 | Título de página |
| Section title | 20px | 600 | Seções e painéis |
| Card title | 16px | 600 | Cards e widgets |
| Body | 14px ou 16px | 400 | Texto principal |
| Body small | 14px | 400 | Descrições, tabelas e listas |
| Caption | 12px | 500 | Labels, badges, metadados |
| Overline | 11px | 600 | Títulos curtos em uppercase |

```css
.text-page-title {
  font-size: 30px;
  font-weight: 700;
  line-height: 1.2;
}

.text-section-title {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
}

.text-card-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.text-body {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.45;
}

.text-caption {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.35;
}

.text-overline {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

---

## 6. Espaçamento

O sistema utilizará uma escala de espaçamento baseada em múltiplos de 4px.

```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
}
```

Padrão recomendado:

- Padding de card: `24px`.
- Gap entre cards: `16px` ou `24px`.
- Padding de página: `24px` a `32px`.
- Padding de botão: `8px 14px` ou `10px 16px`.
- Altura de input: `36px` ou `40px`.
- Altura de header: `56px` a `64px`.
- Largura de sidebar: `240px`.

---

## 7. Bordas, Radius e Sombras

### 7.1 Radius

```css
:root {
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 999px;
}
```

Uso recomendado:

| Elemento | Radius |
|---|---:|
| Botão | 8px |
| Input | 8px |
| Card | 12px |
| Modal | 16px |
| Badge | 999px |
| Avatar | 999px |

### 7.2 Sombras

Como o tema é escuro, sombras devem ser sutis e combinadas com bordas.

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.24);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.28);
  --shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.36);
  --shadow-brand: 0 12px 32px rgba(4, 102, 200, 0.24);
}
```

---

## 8. Layout Base

### 8.1 Estrutura principal

A aplicação deve seguir o padrão:

```txt
AppShell
├── Sidebar
├── Main
│   ├── Header / Topbar
│   └── PageContent
│       ├── PageHeader
│       ├── MetricCards
│       ├── ContentGrid
│       └── Tables / Lists / Charts
```

### 8.2 Sidebar

A sidebar deve ser fixa, escura e com destaque no item ativo.

```css
.sidebar {
  width: 240px;
  background: var(--color-bg-sidebar);
  border-right: 1px solid var(--color-border-subtle);
}

.sidebar-item {
  color: var(--color-text-muted);
  border-radius: var(--radius-md);
}

.sidebar-item:hover {
  background: var(--color-bg-surface-hover);
  color: var(--color-text-primary);
}

.sidebar-item-active {
  background: rgba(4, 102, 200, 0.16);
  color: var(--color-text-primary);
  border-left: 3px solid var(--color-brand-primary);
}
```

Decisão visual:

- Item ativo deve ter fundo azulado sutil.
- Ícone do item ativo pode usar `--color-brand-primary`.
- Itens inativos devem usar texto acinzentado.
- A sidebar pode conter logo, nome do produto, menu principal e ação de sair no rodapé.

### 8.3 Header / Topbar

O header deve conter título contextual, busca, ações rápidas, tema e notificações.

```css
.topbar {
  height: 56px;
  background: var(--color-bg-header);
  border-bottom: 1px solid var(--color-border-subtle);
}
```

---

## 9. Componentes

### 9.1 Botões

#### Botão primário

Usado para ações principais: novo ticket, nova oportunidade, salvar, criar, confirmar.

```css
.button-primary {
  background: var(--color-brand-primary);
  color: #ffffff;
  border: 1px solid var(--color-brand-primary);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  height: 36px;
  padding: 0 14px;
}

.button-primary:hover {
  background: var(--color-brand-primary-hover);
  border-color: var(--color-brand-primary-hover);
}

.button-primary:active {
  background: var(--color-brand-primary-active);
}
```

#### Botão secundário

Usado para ações intermediárias: exportar, filtrar, cancelar, voltar.

```css
.button-secondary {
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  height: 36px;
  padding: 0 14px;
}

.button-secondary:hover {
  background: var(--color-bg-surface-hover);
}
```

#### Botão ghost

Usado em ações discretas dentro de cards, tabelas e menus.

```css
.button-ghost {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid transparent;
}

.button-ghost:hover {
  background: var(--color-bg-surface-hover);
  color: var(--color-text-primary);
}
```

### 9.2 Cards

Cards são a principal superfície visual do sistema.

```css
.card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-6);
}

.card:hover {
  border-color: var(--color-border-default);
}
```

#### Card de métrica

Usado em dashboards para números importantes.

```css
.metric-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.metric-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--color-text-primary);
}
```

Regras:

- Métricas principais podem usar `--color-brand-primary`.
- Métricas positivas usam `--color-success`.
- Métricas de atenção usam `--color-warning`.
- Métricas críticas usam `--color-danger`.

### 9.3 Inputs

```css
.input {
  height: 38px;
  background: #070f22;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: 0 12px;
  font-size: 14px;
}

.input::placeholder {
  color: var(--color-text-disabled);
}

.input:hover {
  border-color: var(--color-border-default);
}

.input:focus {
  outline: none;
  border-color: var(--color-brand-primary);
  box-shadow: 0 0 0 3px rgba(4, 102, 200, 0.20);
}
```

### 9.4 Badges

Badges devem indicar status de forma compacta.

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
}
```

#### Estados recomendados

```css
.badge-open {
  color: var(--color-success);
  background: var(--color-success-muted);
  border: 1px solid var(--color-success-border);
}

.badge-progress {
  color: var(--color-warning);
  background: var(--color-warning-muted);
  border: 1px solid var(--color-warning-border);
}

.badge-resolved {
  color: var(--color-info);
  background: var(--color-info-muted);
  border: 1px solid var(--color-info-border);
}

.badge-danger {
  color: var(--color-danger);
  background: var(--color-danger-muted);
  border: 1px solid var(--color-danger-border);
}
```

Exemplos de uso:

- Aberto
- Em andamento
- Resolvido
- Urgente
- Ativo
- Inativo
- Pendente
- Atrasado

### 9.5 Tabelas

Tabelas devem manter boa leitura em tema escuro.

```css
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th {
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.table td {
  color: var(--color-text-secondary);
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.table tr:hover td {
  background: rgba(151, 157, 172, 0.04);
}
```

### 9.6 Listas de atividade

As listas de atividade, como “Atividade recente” e “Conversas ativas”, devem ser usadas para eventos operacionais recentes.

Estrutura recomendada:

```txt
ActivityItem
├── Código ou identificador
├── Título
├── Responsável
├── Status
└── Data ou metadado
```

Regras:

- O título deve ter maior contraste.
- Metadados devem usar texto muted.
- Status deve ser badge.
- Separadores devem ser sutis.

### 9.7 Modais

```css
.modal {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.modal-description {
  font-size: 14px;
  color: var(--color-text-muted);
}
```

### 9.8 Toasts e alertas

Toasts devem ser objetivos e visíveis, sem competir com o restante da interface.

```css
.toast {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  color: var(--color-text-primary);
  padding: 14px 16px;
}
```

Tipos:

- Success
- Warning
- Error
- Info

---

## 10. Iconografia

Os ícones devem seguir visual simples, linear e consistente.

Regras:

- Usar ícones lineares.
- Espessura recomendada: `1.75px` a `2px`.
- Tamanho padrão: `18px` ou `20px`.
- Tamanho em cards de métrica: `24px`.
- Tamanho em sidebar: `18px`.

Cores:

```css
.icon-default {
  color: var(--color-icon-secondary);
}

.icon-active {
  color: var(--color-brand-primary);
}

.icon-danger {
  color: var(--color-danger);
}
```

---

## 11. Tema escuro

O tema escuro será o tema principal do produto.

### 11.1 Tokens principais

```css
:root {
  --app-background: #001233;
  --app-sidebar: #001845;
  --app-surface: #0b1328;
  --app-surface-secondary: #101a33;
  --app-border: rgba(151, 157, 172, 0.14);
  --app-text: #f8fafc;
  --app-text-muted: #979dac;
  --app-primary: #0466c8;
}
```

### 11.2 Princípios do tema escuro

- Evitar preto absoluto puro em grandes áreas.
- Usar azul profundo como fundo principal.
- Usar contraste moderado entre fundo e cards.
- Usar azul vivo apenas para ações, foco e destaque.
- Evitar excesso de gradiente em áreas de leitura.

---

## 12. Acessibilidade

Decisões obrigatórias:

- Todo texto principal deve ter contraste adequado contra o fundo.
- Estados de foco devem ser visíveis.
- Cor não deve ser o único indicador de status.
- Badges devem combinar cor, texto e, quando necessário, ícone.
- Botões precisam ter estado hover, active, disabled e focus.
- Inputs devem exibir erro com mensagem textual, não apenas borda vermelha.

Exemplo de foco:

```css
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(4, 102, 200, 0.32);
}
```

---

## 13. Estados de componentes

Todo componente interativo deve possuir os seguintes estados:

| Estado | Descrição |
|---|---|
| Default | Estado normal |
| Hover | Quando o usuário passa o mouse |
| Active | Quando o usuário pressiona |
| Focus | Quando navega por teclado |
| Disabled | Quando a ação está bloqueada |
| Loading | Quando há processamento |
| Error | Quando existe falha ou validação |

---

## 14. Tokens finais recomendados

```css
:root {
  /* Font */
  --font-family-base: "Inter", system-ui, sans-serif;

  /* Brand */
  --brand-500: #0466c8;
  --brand-600: #0353a4;
  --brand-700: #023e7d;
  --brand-800: #002855;
  --brand-900: #001845;
  --brand-950: #001233;

  /* Neutral / Slate */
  --slate-500: #33415c;
  --slate-400: #5c677d;
  --slate-300: #7d8597;
  --slate-200: #979dac;

  /* Background */
  --bg-app: #001233;
  --bg-sidebar: #001845;
  --bg-surface: #0b1328;
  --bg-surface-2: #101a33;
  --bg-hover: #16213f;

  /* Text */
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #979dac;
  --text-disabled: #5c677d;

  /* Border */
  --border-subtle: rgba(151, 157, 172, 0.12);
  --border-default: rgba(151, 157, 172, 0.20);
  --border-strong: rgba(151, 157, 172, 0.32);

  /* Status */
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #38bdf8;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 999px;

  /* Shadow */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.24);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.28);
  --shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.36);
}
```

---

## 15. Consequências

### Positivas

- O produto terá uma identidade visual consistente.
- As telas ficarão alinhadas com aparência SaaS moderna.
- Componentes poderão ser reutilizados entre módulos.
- Facilita evolução futura do front-end.
- Facilita implementação em React, Next.js, Tailwind, Flutter Web ou qualquer stack com CSS tokens.
- Reduz decisões visuais repetidas em cada nova tela.

### Negativas

- O tema dark-first exige maior cuidado com contraste.
- Algumas cores semânticas precisam ser adicionadas fora da paleta azul.
- Gradientes devem ser usados com moderação para não deixar a interface visualmente pesada.
- Componentes precisam respeitar tokens, evitando estilos manuais isolados.

---

## 16. Decisão final

Fica definido que o produto adotará um **Design System dark-first**, com base em azul profundo, superfícies escuras, contraste sutil, ações principais em `#0466c8` e tipografia oficial **Inter**.

A interface deverá seguir o padrão visual observado nos protótipos enviados: dashboard escuro, sidebar fixa, cards elevados, badges de status, botões azuis, tabelas limpas e hierarquia visual objetiva.

Este ADR deve ser usado como referência para criação de novos componentes, telas, protótipos, tokens CSS, temas Tailwind e bibliotecas internas de UI.
