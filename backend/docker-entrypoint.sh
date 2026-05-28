#!/bin/sh
set -e

pwd
echo "Teste V2.4.14"
echo "Rodando migrations..."
npm run migration:run

echo "Iniciando aplicação..."
exec "$@"