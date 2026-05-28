#!/bin/sh
set -e

pwd
echo "Rodando migrations..."
npm run migration:run

echo "Iniciando aplicação..."
exec "$@"