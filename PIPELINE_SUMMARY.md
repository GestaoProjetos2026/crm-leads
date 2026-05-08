# ✅ CI/CD Pipeline - Resumo de Implementação

## 📦 Arquivos Criados

```
.github/
├── workflows/
│   └── deploy.yml              # Workflow principal do GitHub Actions
└── DEPLOY_SETUP.md             # Guia de configuração do GitHub Secrets

scripts/
└── deploy.sh                   # Script auxiliar de gerenciamento de containers

docker-compose.prod.yml         # Docker Compose para produção (deps apenas)
VM_SETUP.md                     # Guia de setup da VM
```

## 🔄 Fluxo do Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│  1. Push para branch "Feature"                              │
│     ↓                                                        │
│  2. GitHub Actions dispara                                  │
│     ↓                                                        │
│  3. Build Docker image (target: production)                │
│     ├─ Node 24 Alpine                                       │
│     ├─ Multi-stage: builder + production                    │
│     └─ Otimizado para tamanho e segurança                  │
│     ↓                                                        │
│  4. Push para Docker Hub (gitact/salesweakness-api)        │
│     ├─ Tag: Feature-{SHA}                                   │
│     ├─ Tag: Feature (branch)                                │
│     └─ Tag: latest                                          │
│     ↓                                                        │
│  5. SSH na VM (gp2026@20.39.132.34)                         │
│     ├─ Enviar .env via SCP                                  │
│     ├─ Pull da imagem latest                                │
│     ├─ Parar container antigo                               │
│     ├─ Remover container antigo                             │
│     └─ Iniciar novo container                               │
│        ├─ Rede: salesweakness                               │
│        ├─ Porta: 3000:3000                                  │
│        └─ Variáveis de ambiente do .env                    │
│     ↓                                                        │
│  6. Verificação de saúde                                    │
│     └─ Container rodando? ✓                                 │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Segurança Implementada

✅ **Chave SSH privada** - armazenada em Secrets, não no repo
✅ **Credenciais Docker Hub** - em Secrets, não no código
✅ **Arquivo .env** - enviado via SCP, não commitado
✅ **Usuário não-root** - container roda como node user
✅ **Network isolada** - comunicação interna via rede Docker
✅ **StrictHostKeyChecking** - desabilitado após verificação inicial

## 📋 Configuração Necessária

### 1. GitHub Secrets (5 min)
```
DEPLOY_SSH_PRIVATE_KEY  → Sua chave RSA 4096
DOCKER_USERNAME         → Usuario Docker Hub
DOCKER_PASSWORD         → Token Docker Hub
```

### 2. GitHub Repository (2 min)
- ✅ Branches protegidas (Feature branch)
- ✅ Workflow permissions (Actions pode ler/escrever)

### 3. Docker Hub (3 min)
- ✅ Criar repositório: `gitact/salesweakness-api`
- ✅ Gerar token de acesso (Settings → Security)

### 4. VM de Produção (15 min)
```bash
# Executar em ordem:
1. Instalar Docker e Docker Compose
2. Criar usuário gp2026 com acesso sudo
3. Adicionar chave SSH pública ao authorized_keys
4. Criar diretórios: ~/salesweakness/backend
5. Criar arquivo .env
6. Iniciar containers dependentes com docker-compose.prod.yml
```

### 5. SSH Key Setup (5 min)
```bash
# Gerar (se não tiver)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key -N ""

# Copiar chave pública para VM
ssh-copy-id -i ~/.ssh/deploy_key gp2026@20.39.132.34

# Adicionar ao GitHub Secrets (DEPLOY_SSH_PRIVATE_KEY)
cat ~/.ssh/deploy_key | xclip -selection clipboard
```

## 🚀 Primeira Execução

### Passo 1: Verificar estrutura
```bash
ls -la .github/workflows/    # Deve ter deploy.yml
ls -la scripts/              # Deve ter deploy.sh
cat .github/DEPLOY_SETUP.md  # Para referência
```

### Passo 2: Testar SSH localmente
```bash
ssh -i ~/.ssh/deploy_key gp2026@20.39.132.34 "docker ps"
```

### Passo 3: Fazer push para Feature
```bash
git add .github/ scripts/ docker-compose.prod.yml VM_SETUP.md
git commit -m "feat: implementa pipeline CI/CD com GitHub Actions"
git push origin Feature
```

### Passo 4: Monitorar no GitHub
- Abra: https://github.com/seu-usuario/SalesWeakness/actions
- Clique no workflow "Deploy to Production"
- Acompanhe cada step (build, push, deploy)

### Passo 5: Verificar na VM
```bash
ssh gp2026@20.39.132.34
docker ps | grep salesweakness-api
docker logs -f salesweakness-api
```

## 📊 Fases e Tempos Esperados

| Fase | Tempo | O que acontece |
|------|-------|-------|
| **Checkout** | 5s | Clonar código |
| **Setup Buildx** | 3s | Preparar Docker |
| **Login Docker** | 2s | Autenticar Docker Hub |
| **Build** | 30-60s | Compilar imagem (cache ajuda) |
| **Push** | 10-30s | Enviar para Docker Hub |
| **SSH Setup** | 2s | Configurar chave SSH |
| **Transfer .env** | 2s | Enviar arquivo via SCP |
| **Deploy** | 15-30s | Pull, parar, iniciar container |
| **TOTAL** | ~1-3 min | Do push ao container rodando |

## 🎯 Verificação Final

```bash
# ✅ No GitHub
[ ] Workflow "Deploy to Production" executado com sucesso
[ ] Build da imagem completo
[ ] Push para Docker Hub sucesso
[ ] Deploy SSH executado

# ✅ Na VM
[ ] Container salesweakness-api rodando
[ ] Porta 3000 respondendo
[ ] Conectado à rede salesweakness
[ ] Conectado ao database
[ ] Conectado ao redis

# ✅ Aplicação
[ ] Endpoints respondendo
[ ] Database queries funcionando
[ ] Cache Redis funcionando
```

## 🔄 Deploys Futuros

Agora é automático! Basta fazer:

```bash
# Fazer mudanças no backend
cd backend
# ... editar código ...

# Fazer commit e push
git add .
git commit -m "feat: nova feature"
git push origin Feature

# GitHub Actions cuida do resto! 🚀
```

## 📈 Monitorar e Gerenciar

### Ver status dos containers na VM
```bash
~/bin/deploy.sh status
~/bin/deploy.sh logs
~/bin/deploy.sh health
```

### Atualizar manualmente (se necessário)
```bash
~/bin/deploy.sh update      # Pull + restart
~/bin/deploy.sh restart     # Só reinicia
~/bin/deploy.sh pull        # Só faz pull
```

### Troubleshooting rápido
```bash
~/bin/deploy.sh logs 50           # Últimas 50 linhas
docker stats salesweakness-api    # Monitorar recursos
docker inspect salesweakness-api  # Detalhes completos
```

## 🚨 Possíveis Problemas

| Problema | Solução |
|----------|---------|
| **"Permission denied (publickey)"** | Chave SSH não configurada em authorized_keys |
| **"Unable to find image"** | Credenciais Docker Hub incorretas no Secrets |
| **"Container fails to start"** | .env não foi copiado corretamente ou variáveis incorretas |
| **"Network not found"** | Executar: `docker network create salesweakness` |
| **"Port 3000 already in use"** | Container antigo ainda rodando ou outra aplicação na porta |

## 📚 Documentação Adicional

- **`.github/DEPLOY_SETUP.md`** - Instruções completas de configuração
- **`VM_SETUP.md`** - Setup da máquina de produção
- **`scripts/deploy.sh`** - Script auxiliar com 10+ comandos
- **`docker-compose.prod.yml`** - Configuração dos containers dependentes

## ✨ Recursos Bônus

### Script de Deploy Helper
```bash
~/bin/deploy.sh status      # Status dos containers
~/bin/deploy.sh logs        # Ver logs
~/bin/deploy.sh update      # Atualizar app
~/bin/deploy.sh restart     # Reiniciar
~/bin/deploy.sh stop        # Parar
~/bin/deploy.sh remove      # Remover
~/bin/deploy.sh health      # Verificar saúde
~/bin/deploy.sh cleanup     # Limpar imagens antigas
~/bin/deploy.sh shell       # Acessar shell do container
```

### Docker Compose para Dependências
- Gerencia Postgres e Redis automaticamente
- Healthchecks configurados
- Volumes persistentes
- Network isolada

---

## ✅ Próximos Passos

1. **Hoje**: Seguir `.github/DEPLOY_SETUP.md` para configurar Secrets
2. **Hoje**: Seguir `VM_SETUP.md` para preparar a VM
3. **Hoje**: Fazer primeiro push para testar pipeline
4. **Amanhã**: Monitorar logs e ajustar conforme necessário
5. **Sempre**: Usar `~/bin/deploy.sh` para gerenciar na VM

---

**Status:** ✅ Pipeline implementado e pronto para configuração

**Próximo:** Abra `.github/DEPLOY_SETUP.md` para começar a configuração!
