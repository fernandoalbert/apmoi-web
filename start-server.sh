#!/usr/bin/env bash
# Jalankan server statis APMOI.
# Usage: ./start-server.sh [port]   (default: 8080)
set -e
PORT="${1:-${PORT:-8080}}"
HOST="${HOST:-0.0.0.0}"
echo "APMOI server → http://${HOST}:${PORT}"
exec python3 -m http.server "$PORT" --bind "$HOST"
