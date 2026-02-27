#!/bin/bash
# generate-certs.sh - Genera certificados TLS locales con mkcert
#
# Requisitos:
#   - mkcert instalado (https://github.com/FiloSottile/mkcert)
#   - mkcert -install (para que los certificados sean confiables)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CERTS_DIR="$SCRIPT_DIR/certs"

mkdir -p "$CERTS_DIR"

echo "Generando certificados en $CERTS_DIR..."

mkcert -cert-file "$CERTS_DIR/alcstronghold.local.pem" \
       -key-file "$CERTS_DIR/alcstronghold.local-key.pem" \
       "*.alcstronghold.local" alcstronghold.local

mkcert -cert-file "$CERTS_DIR/devtools.local.pem" \
       -key-file "$CERTS_DIR/devtools.local-key.pem" \
       "*.devtools.local" devtools.local

echo "Certificados generados correctamente."
