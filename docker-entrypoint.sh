#!/bin/sh
set -e

UPLOADS_DIR="${UPLOADS_DIR:-./public/uploads}"
mkdir -p "$UPLOADS_DIR/presentes" "$UPLOADS_DIR/fotos"

exec "$@"
