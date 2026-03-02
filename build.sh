#!/usr/bin/env bash
set -euo pipefail

python -m pip install --upgrade pip

if [ -f backend/requirements.txt ]; then
  pip install -r backend/requirements.txt
else
  pip install -r requirements.txt
fi

if [ -d frontend ]; then
  npm --prefix frontend ci
  npm --prefix frontend run build
fi
