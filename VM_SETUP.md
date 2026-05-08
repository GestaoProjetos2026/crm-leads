# 🚀 Guia de Inicialização - VM de Produção

## 1️⃣ Setup Inicial da VM

### Instalação de Dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker (evita sudo)
sudo usermod -aG docker $USER
newgrp docker

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

### Estrutura de Diretórios

```bash
# Na home do usuário gp2026
mkdir -p ~/salesweakness/backend
cd ~/salesweakness

# Copiar o docker-compose.prod.yml do repositório
cp docker-compose.prod.yml ~/salesweakness/
```

## 2️⃣ Configurar Variáveis de Ambiente

Criar arquivo `.env` para os containers dependentes:

```bash
cat > ~/salesweakness/.env << 'EOF'
# Postgres
DB_USER=salesweakness
DB_PASSWORD=sua_senha_forte_aqui
DB_NAME=salesweakness

# Redis (geralmente sem autenticação em ambiente privado)
REDIS_PASSWORD=
EOF

chmod 600 ~/salesweakness/.env
```

Criar arquivo `.env` para a aplicação (será enviado pelo pipeline):

```bash
mkdir -p ~/salesweakness/backend
cat > ~/salesweakness/backend/.env << 'EOF'
NODE_ENV=production
DB_HOST=salesweakness-db
DB_PORT=5432
DB_USER=salesweakness
DB_PASSWORD=sua_senha_forte_aqui
DB_NAME=salesweakness
REDIS_HOST=salesweakness-redis
REDIS_PORT=6379
PORT=3000
EOF

chmod 600 ~/salesweakness/backend/.env
```

## 3️⃣ Iniciar Containers Dependentes

```bash
cd ~/salesweakness

# Criar a rede Docker (necessária para a aplicação)
docker network create salesweakness 2>/dev/null || true

# Iniciar Postgres e Redis
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps

# Ver logs (se necessário)
docker-compose -f docker-compose.prod.yml logs -f postgres redis
```

## 4️⃣ Clonar Script de Deploy

```bash
# Copiar o script de deploy do repositório para a VM
mkdir -p ~/bin
cp scripts/deploy.sh ~/bin/deploy.sh
chmod +x ~/bin/deploy.sh

# Ou criar alias
alias swdeploy="~/bin/deploy.sh"
```

## 5️⃣ Primeiro Deploy Manual

Quando o pipeline fizer SSH e executar o deploy, ele automático. Mas para testar manualmente:

```bash
# Pull da imagem
docker pull docker.io/gitact/salesweakness-api:latest

# Usando o script helper
~/bin/deploy.sh update

# Ou verificar status
~/bin/deploy.sh status
~/bin/deploy.sh logs
```

## 📋 Checklist de Segurança

- [ ] SSH key configurada e adicionada a `authorized_keys`
- [ ] Arquivo `.env` com senhas fortes (diferentes de dev)
- [ ] Permissões corretas: `chmod 600 .env`
- [ ] Docker rodando sem sudo para o usuário
- [ ] Rede Docker `salesweakness` criada
- [ ] Firewall configurado (porta 3000 acessível conforme necessário)
- [ ] Backup de dados Postgres configurado
- [ ] Logs de container monitorados

## 🔧 Monitoramento Contínuo

### Ver logs em tempo real
```bash
docker logs -f salesweakness-api
docker logs -f salesweakness-db
docker logs -f salesweakness-redis
```

### Monitorar uso de recursos
```bash
docker stats salesweakness-api salesweakness-db salesweakness-redis
```

### Verificar saúde
```bash
docker ps -a --format "table {{.Names}}\t{{.Status}}"
```

## 🆘 Troubleshooting

### Container não inicia
```bash
# Ver erro
docker logs salesweakness-api

# Remover e tentar novamente
docker rm -f salesweakness-api
~/bin/deploy.sh update
```

### Problema com .env
```bash
# Verificar se arquivo existe
ls -la ~/salesweakness/backend/.env

# Verificar conteúdo (cuidado com senhas)
cat ~/salesweakness/backend/.env

# Reiniciar container
docker restart salesweakness-api
```

### Postgres não inicia
```bash
# Ver logs
docker logs salesweakness-db

# Verificar permissões de volume
ls -la $(docker inspect -f '{{ .Mounts }}' salesweakness-db)

# Remover e reiniciar
docker-compose -f docker-compose.prod.yml down
docker volume rm salesweakness-postgres-data  # ⚠️ PERDERÁ DADOS
docker-compose -f docker-compose.prod.yml up -d
```

### Redis não responde
```bash
# Testar conectividade
docker exec salesweakness-redis redis-cli ping

# Ver logs
docker logs salesweakness-redis
```

## 📈 Backup e Manutenção

### Backup automático do Postgres
```bash
#!/bin/bash
# backup_db.sh
BACKUP_DIR="$HOME/backups/salesweakness"
mkdir -p "$BACKUP_DIR"

docker exec salesweakness-db pg_dump -U salesweakness salesweakness | \
  gzip > "$BACKUP_DIR/salesweakness_$(date +%Y%m%d_%H%M%S).sql.gz"

# Manter apenas os últimos 7 dias
find "$BACKUP_DIR" -type f -mtime +7 -delete
```

Adicionar ao crontab:
```bash
crontab -e
# Adicionar: 0 2 * * * /home/gp2026/bin/backup_db.sh
```

### Limpeza de imagens antigas
```bash
# Listar imagens não usadas
docker image ls -f "dangling=true"

# Remover
docker image prune -f
```

## ✅ Próximos Passos

1. Executar este guia em ordem
2. Testar acesso SSH: `ssh gp2026@20.39.132.34`
3. Confirmar que Docker está operacional
4. Fazer primeiro push para branch `Feature` e monitore o GitHub Actions
5. Verificar que o container iniciou: `docker ps | grep salesweakness-api`
6. Testar endpoint da aplicação

---

**Dúvidas?** Verifique os logs com `docker logs -f [container_name]`
