#!/usr/bin/env bash
set -euo pipefail

export PYTHONPATH="$(pwd):${PYTHONPATH:-}"

DB_FILE=$(mktemp)
trap "rm -f ${DB_FILE}" EXIT
poetry run pytest -q "$@"
