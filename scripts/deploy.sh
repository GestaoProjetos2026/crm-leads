#!/bin/bash

# Deploy Helper Script para SalesWeakness
# Uso: ./deploy.sh [comando]

set -e

CONTAINER_NAME="salesweakness-api"
IMAGE_NAME="gitact/salesweakness-api"
REGISTRY="docker.io"
ENV_FILE="$HOME/salesweakness/backend/.env"
NETWORK="salesweakness"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado"
        exit 1
    fi
}

# Criar rede se não existir
ensure_network() {
    if ! docker network ls | grep -q "$NETWORK"; then
        log_info "Criando rede Docker: $NETWORK"
        docker network create "$NETWORK"
        log_success "Rede criada"
    else
        log_success "Rede $NETWORK já existe"
    fi
}

# Verificar arquivo .env
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Arquivo .env não encontrado em: $ENV_FILE"
        exit 1
    fi
    log_success "Arquivo .env encontrado"
}

# Status dos containers
status() {
    log_info "Verificando status dos containers..."
    echo ""
    echo "Backend:"
    docker ps -a --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || log_warning "Nenhum container"

    echo ""
    echo "Dependências:"
    docker ps -a --filter "name=salesweakness-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -v "^NAMES" || log_warning "Nenhum container dependente"
}

# Logs do container
logs() {
    if [ -z "$1" ]; then
        LINES=100
    else
        LINES=$1
    fi

    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_info "Últimas $LINES linhas de log:"
        docker logs --tail "$LINES" -f "$CONTAINER_NAME"
    else
        log_error "Container $CONTAINER_NAME não existe"
        exit 1
    fi
}

# Restart do container
restart() {
    check_env_file

    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_info "Parando container..."
        docker stop "$CONTAINER_NAME"
        docker rm "$CONTAINER_NAME"
        sleep 1
    fi

    log_info "Iniciando container..."
    docker run -d \
        --name "$CONTAINER_NAME" \
        --restart unless-stopped \
        -p 3000:3000 \
        --env-file "$ENV_FILE" \
        --network "$NETWORK" \
        -e DB_HOST=salesweakness-db \
        -e REDIS_HOST=salesweakness-redis \
        "$REGISTRY/$IMAGE_NAME:latest"

    sleep 2

    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_success "Container iniciado com sucesso!"
    else
        log_error "Falha ao iniciar container"
        docker logs "$CONTAINER_NAME"
        exit 1
    fi
}

# Pull da imagem mais recente
pull() {
    log_info "Fazendo pull da imagem: $REGISTRY/$IMAGE_NAME:latest"
    docker pull "$REGISTRY/$IMAGE_NAME:latest"
    log_success "Imagem atualizada"
}

# Atualizar e reiniciar
update() {
    log_info "Atualizando aplicação..."
    pull
    restart
    log_success "Aplicação atualizada!"
}

# Parar container
stop() {
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_info "Parando container..."
        docker stop "$CONTAINER_NAME"
        log_success "Container parado"
    else
        log_warning "Container não está rodando"
    fi
}

# Remover container
remove() {
    stop
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_info "Removendo container..."
        docker rm "$CONTAINER_NAME"
        log_success "Container removido"
    fi
}

# Cleanup de imagens antigas
cleanup() {
    log_info "Removendo imagens não usadas..."
    docker image prune -f
    log_success "Cleanup concluído"
}

# Shell do container
shell() {
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_info "Abrindo shell no container..."
        docker exec -it "$CONTAINER_NAME" /bin/sh
    else
        log_error "Container não está rodando"
        exit 1
    fi
}

# Health check
health() {
    log_info "Verificando saúde da aplicação..."
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        HEALTH=$(docker inspect "$CONTAINER_NAME" | grep -o '"Health".*' || echo '"Health": "unknown"')
        echo "Status: $HEALTH"

        # Tentar conectar
        if curl -s http://localhost:3000/health &> /dev/null; then
            log_success "Aplicação respondendo normalmente"
        else
            log_warning "Endpoint /health não respondeu"
        fi
    else
        log_error "Container não está rodando"
        exit 1
    fi
}

# Exibir ajuda
usage() {
    echo "SalesWeakness Deploy Helper"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  status      - Mostrar status dos containers"
    echo "  logs [N]    - Mostrar últimas N linhas de log (padrão: 100)"
    echo "  restart     - Parar e reiniciar o container"
    echo "  pull        - Fazer pull da imagem mais recente"
    echo "  update      - Atualizar imagem e reiniciar container"
    echo "  stop        - Parar o container"
    echo "  remove      - Remover o container"
    echo "  cleanup     - Remover imagens não usadas"
    echo "  shell       - Abrir shell no container"
    echo "  health      - Verificar saúde da aplicação"
    echo "  help        - Mostrar esta ajuda"
    echo ""
}

# Main
check_docker
ensure_network

case "${1:-status}" in
    status)
        status
        ;;
    logs)
        logs "$2"
        ;;
    restart)
        restart
        ;;
    pull)
        pull
        ;;
    update)
        update
        ;;
    stop)
        stop
        ;;
    remove)
        remove
        ;;
    cleanup)
        cleanup
        ;;
    shell)
        shell
        ;;
    health)
        health
        ;;
    help|--help|-h)
        usage
        ;;
    *)
        log_error "Comando desconhecido: $1"
        usage
        exit 1
        ;;
esac
