import sys
from pathlib import Path

# Ensure the repo root is on sys.path so `import backend.*` works on Vercel.
ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.main import app  # re-export FastAPI app for Vercel entrypoint
