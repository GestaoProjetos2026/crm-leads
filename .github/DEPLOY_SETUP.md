# CI/CD Pipeline - Guia de Configuração

## 📋 Visão Geral

O pipeline automatiza o deploy da aplicação sempre que há um push para a branch `Feature`. O workflow:

1. ✅ Faz checkout do código
2. 🔨 Compila a imagem Docker (target: production)
3. 📤 Faz push para o Docker Hub
4. 🚀 Conecta via SSH na VM de produção
5. 📥 Faz pull da nova imagem
6. 🔄 Para/remove o container antigo
7. ▶️ Inicia o novo container

---

## 🔑 Configurar GitHub Secrets

Você precisa adicionar os seguintes secrets no repositório do GitHub:

### 1. **DEPLOY_SSH_PRIVATE_KEY**
Sua chave SSH privada para conectar na VM

```bash
# Gerar chave (se não tiver)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key -N ""

# Copiar a chave privada
cat ~/.ssh/deploy_key

# Na chave pública, adicionar na VM:
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys
```

**No GitHub:**
1. Vá para: **Settings → Secrets and variables → Actions**
2. Clique em **New repository secret**
3. Nome: `DEPLOY_SSH_PRIVATE_KEY`
4. Cole todo o conteúdo da chave privada

### 2. **DOCKER_USERNAME**
Seu usuário do Docker Hub

**No GitHub:**
1. Vá para: **Settings → Secrets and variables → Actions**
2. Clique em **New repository secret**
3. Nome: `DOCKER_USERNAME`
4. Valor: seu username do Docker Hub

### 3. **DOCKER_PASSWORD**
Seu token/senha do Docker Hub

**No GitHub:**
1. Vá para: **Settings → Secrets and variables → Actions**
2. Clique em **New repository secret**
3. Nome: `DOCKER_PASSWORD`
4. Valor: seu token do Docker Hub (gerar em https://hub.docker.com/settings/security)

---

## ✅ Pré-requisitos na VM

### 1. Docker instalado
```bash
# Verificar se já tem
docker --version
```

### 2. Docker network criada
```bash
# Criar a rede (se não existir)
docker network create salesweakness || true
```

### 3. Estrutura de diretórios
```bash
# Na VM (home do usuário gp2026)
mkdir -p ~/salesweakness/backend
```

### 4. Arquivo .env
O arquivo será enviado automaticamente pelo pipeline, mas garanta que existe com as variáveis necessárias:

```bash
# Em backend/.env no seu repositório local
NODE_ENV=production
DATABASE_URL=postgresql://user:password@salesweakness-db:5432/salesweakness
REDIS_URL=redis://salesweakness-redis:6379
# ... outras variáveis necessárias
```

### 5. Containers dependentes já rodando
```bash
# Verificar se estão rodando
docker ps | grep -E "(salesweakness-db|salesweakness-redis)"

# Se não estiverem, iniciar manualmente
docker run -d --name salesweakness-db --network salesweakness -e POSTGRES_PASSWORD=... postgres:16
docker run -d --name salesweakness-redis --network salesweakness redis:7-alpine
```

---

## 🚀 Como funciona o pipeline

### Trigger
- **Branch:** Feature
- **Event:** Push
- **Paths:** Backend, docker-compose.yml ou o próprio workflow

### Build & Push
- Compila usando `Dockerfile` com target `production`
- Tags: branch name + SHA commit + latest
- Push automático para `gitact/salesweakness-api`

### Deploy SSH
1. Configura chave SSH segura
2. Envia `.env` para a VM via SCP
3. Executa script remoto que:
   - Faz login no Docker Hub
   - Pull da nova imagem com tag `latest`
   - Para/remove container antigo (`salesweakness-api`)
   - Inicia novo container com:
     - Variáveis de ambiente do .env
     - Rede Docker: `salesweakness`
     - Porta: 3000
     - Restart: unless-stopped

---

## 🔍 Monitorar Deploy

### Ver logs do workflow
1. Vá para: **Actions** no GitHub
2. Clique no último workflow de deploy
3. Veja os logs detalhados de cada step

### Verificar container na VM
```bash
# SSH na VM
ssh gp2026@20.39.132.34

# Ver container rodando
docker ps | grep salesweakness-api

# Ver logs
docker logs -f salesweakness-api

# Ver status da saúde
docker inspect salesweakness-api | grep -A 5 "Health"
```

---

## 🐛 Troubleshooting

### Erro: "Permission denied" no SSH
- Verifique se a chave pública está em `~/.ssh/authorized_keys` da VM
- Confirme permissões: `chmod 600 ~/.ssh/authorized_keys`

### Erro: "Unable to find image locally"
- Verificar credenciais Docker Hub (`DOCKER_USERNAME` e `DOCKER_PASSWORD`)
- Confirmar que a imagem existe no Docker Hub

### Container não inicia
- Ver logs: `docker logs -f salesweakness-api`
- Verificar variáveis de ambiente: `.env` foi copiado corretamente?
- Verificar conectividade com banco/redis

### Network não encontrada
- Criar rede: `docker network create salesweakness`
- Confirmar que postgres e redis estão na rede

---

## 📝 Customizações Futuras

Se precisar alterar:

| Alteração | Onde mudar |
|-----------|-----------|
| Porta do container | `.github/workflows/deploy.yml` - `CONTAINER_PORT` |
| Branch do deploy | `.github/workflows/deploy.yml` - `on.push.branches` |
| VM/Host | `.github/workflows/deploy.yml` - `DEPLOY_HOST`, `DEPLOY_USER` |
| Nome da imagem | `.github/workflows/deploy.yml` - `IMAGE_NAME` |
| Variáveis de ambiente | `backend/.env` |

---

## ✨ Próximos passos

1. ✅ Gerar e configurar chaves SSH
2. ✅ Criar tokens Docker Hub
3. ✅ Adicionar secrets no GitHub
4. ✅ Fazer um push para a branch `Feature` para testar
5. ✅ Verificar workflow no GitHub Actions
6. ✅ Confirmar deploy na VM

Boa sorte! 🚀
