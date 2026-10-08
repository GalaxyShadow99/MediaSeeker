#!/bin/bash
set -euo pipefail
source .venv/bin/activate

echo "Please choose what you want to launch:"
echo "1. Backend"
echo "2. Linter"
echo "3. Pytest"

echo "4. Frontend"
read -p "Please enter your choice (1, 2, 3, or 4): " choice

if [ "$choice" = "1" ]; then
    uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 3000
elif [ "$choice" = "2" ]; then
    uv run ruff check --fix && uv run ruff format && uv run ruff check && uv run ruff format --check
elif [ "$choice" = "3" ]; then
    uv run pytest -v
elif [ "$choice" = "4" ]; then
    # Launch frontend
    echo "Launching frontend..."
else
    echo "Invalid choice."
fi