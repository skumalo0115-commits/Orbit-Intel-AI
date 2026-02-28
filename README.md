# NebulaGlass AI — Futuristic AI Document Intelligence Platform

Production-ready full-stack starter for AI-powered document intelligence with a futuristic glassmorphism UI.

## Stack

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS + Framer Motion
- **Backend:** FastAPI + SQLAlchemy + JWT + bcrypt
- **Database:** PostgreSQL
- **AI:** Transformers pipelines (classification, summarization, NER), sentence embeddings

## Monorepo Structure

```bash
backend/
  main.py
  routes/
  services/
  models/
  ai/
  database/
frontend/
  src/components/
  src/pages/
  src/services/
  src/hooks/
```

## Features

- JWT auth with register/login/logout flow
- Upload support for PDF, DOCX, TXT, CSV, PNG, JPG, JPEG
- Text extraction via pdfplumber, python-docx, pytesseract
- AI analysis pipeline:
  - document classification
  - summarization
  - entity extraction
  - embeddings + lightweight insights
- Dashboard + analysis views with glassmorphism + neon glow styling
- Animated space background + mouse-reactive glow

## Local Development (VS Code)

Use **two VS Code terminals** (backend + frontend), and keep both running.

### 0) Open in VS Code

```bash
code .
```

### 1) Optional: Start PostgreSQL (Postgres mode only)

> Default local DB is now SQLite (`sqlite:///./nebulaglass.db`) so login/register work out of the box.
> If you prefer Postgres, start it and set `DATABASE_URL` in `.env`.

```bash
docker compose up -d
```

### 2) Backend terminal (Terminal A)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cp backend/.env.example .env
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Quick check (in another terminal):

```bash
curl http://localhost:8000/
```

Expected response:

```json
{"status":"ok","service":"NebulaGlass AI"}
```

### 3) Frontend terminal (Terminal B)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev -- --host 0.0.0.0 --port 5173
```

Open `http://localhost:5173`.

### 4) Make sure frontend is linked to backend

Set the frontend API URL in `frontend/.env`:

```bash
VITE_API_URL=http://localhost:8000
```

If login/upload/analysis requests fail in the browser, check:
- backend is running on `:8000`
- frontend is running on `:5173`
- `frontend/.env` has the correct `VITE_API_URL`
- if using Postgres, the container is up (`docker compose ps`)

## Railway Deployment Notes

### Backend service

- Root directory: repository root
- Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- Add environment variables:
  - `DATABASE_URL` (Railway Postgres URL using `postgresql+psycopg2://`)
  - `SECRET_KEY`
  - `ACCESS_TOKEN_EXPIRE_MINUTES` (optional)

### Frontend service

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Start command: `npm run preview -- --host 0.0.0.0 --port $PORT`
- Env: `VITE_API_URL=https://<your-backend-domain>`

## API Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /upload`
- `GET /documents`
- `GET /documents/{id}`
- `POST /analyze/{document_id}`
- `GET /analysis/{document_id}`
- `POST /ask-question/{document_id}`

## Notes

- Transformer model downloads happen at runtime on first analysis call.
- OCR on images requires Tesseract binary available in deployment image.
- For advanced Q&A (Mistral/Llama), you can extend `POST /ask-question/{document_id}` with a local LLM runtime.
