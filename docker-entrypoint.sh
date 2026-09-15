#!/bin/sh
set -e

UPLOADS_DIR="${UPLOADS_DIR:-./public/uploads}"
mkdir -p "$UPLOADS_DIR/presentes" "$UPLOADS_DIR/fotos"

echo "Sincronizando schema do banco de dados (prisma db push)..."
npx prisma db push --skip-generate

exec "$@"
