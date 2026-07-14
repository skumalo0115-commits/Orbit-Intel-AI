from __future__ import annotations

import importlib.util
from pathlib import Path

# Vercel sometimes runs the entrypoint with a working directory / import path
# where the `backend` package isn't discoverable. Load backend/main.py by path
# to avoid `ModuleNotFoundError: backend`.
ROOT = Path(__file__).resolve().parent
BACKEND_MAIN_PATH = ROOT / "backend" / "main.py"

spec = importlib.util.spec_from_file_location("backend_main", BACKEND_MAIN_PATH)
if spec is None or spec.loader is None:
    raise RuntimeError(f"Failed to load backend main module from: {BACKEND_MAIN_PATH}")

module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

# Re-export FastAPI app for Vercel entrypoint
app = module.app
