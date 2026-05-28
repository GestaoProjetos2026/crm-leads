#!/bin/sh
set -e

# echo "Rodando as dependencias..."
# npm install -D ts-node typescript
# npm install

echo "Rodando migrations..."
npm run migration:run

echo "Iniciando aplicação..."
exec "$@"