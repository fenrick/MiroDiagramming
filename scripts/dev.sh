#!/usr/bin/env bash
set -euo pipefail

# Unified application runner (development convenience)
exec poetry run python scripts/run.py --reload "$@"
