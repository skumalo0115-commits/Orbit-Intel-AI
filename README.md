# 🚀 Orbit Intel-AI — AI Career Intelligence Platform

<img width="1880" height="896" alt="image" src="https://github.com/user-attachments/assets/eff51d06-19e7-4cd8-9e9b-51b572e04fb5" />


An end-to-end career guidance app that lets users upload a CV, compare it to a target role, and get practical, evidence-based recommendations.

---

## ✨ Core Features

- 🔐 **Secure Auth**: Register/Login with JWT.
- 📄 **CV Upload**: PDF, DOCX, DOC, TXT, CSV, RTF, PNG, JPG, JPEG.
- 🧠 **Built-in AI Analysis**: Local role-fit engine (no external LLM key required).
- 🎯 **Role Match + Gap Detection**: Top matches, percentages, strengths, and missing requirements.
- 💬 **Career Assistant Q&A**: Ask questions about fit/improvements on Analysis page.
- 🌌 **Modern UI**: React + Tailwind + motion effects.

---

## 🧱 Tech Stack

- ⚛️ Frontend: React 18, TypeScript, Vite, TailwindCSS, Framer Motion
- 🐍 Backend: FastAPI, SQLAlchemy, JWT auth
- 🗄️ DB: SQLite by default, PostgreSQL for production

---

## 📁 Project Layout

```bash
backend/
  ai/
  routes/
  models/
  schemas/
  database/
frontend/
  src/pages/
  src/components/
  src/services/
```

---

## 🛠️ Local Development

### 1) Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:

```bash
curl http://localhost:8000/
```

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev -- --host 0.0.0.0 --port 5173
```

Open: `http://localhost:5173`

If needed set API URL in `frontend/.env`:

```bash
VITE_API_URL=http://localhost:8000
```

---

## 📡 API Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /upload`
- `GET /documents`
- `GET /documents/{id}`
- `DELETE /documents/{id}`
- `POST /analyze/{document_id}`
- `GET /analysis/{document_id}`
- `POST /ask-question/{document_id}`

---

## ✅ Supported Upload Formats

- 📄 PDF
- 📝 DOCX / DOC
- 📊 TXT / CSV / RTF
- 🖼️ PNG / JPG / JPEG

---

## ⚙️ Configuration

Required environment variables:

- `SECRET_KEY`
- `DATABASE_URL` (for production/Postgres)

Built-in analysis does **not** require OpenAI keys.

Check runtime readiness:

```bash
GET /env-check
```

Expected:
- `ready: true`
- `required.SECRET_KEY: true`
- `required.DATABASE_URL: true` (in production)

---

## 🚂 Railway Deployment (Quick Guide)

For full step-by-step instructions (PowerShell + Bash), see:

- 📘 `RAILWAY_DEPLOYMENT.md`

Quick checklist:
1. Push repo to GitHub.
2. Railway → New Project → Deploy from GitHub Repo.
3. Add PostgreSQL plugin.
4. Set service vars: `SECRET_KEY`, `DATABASE_URL`.
5. Deploy and confirm `/env-check` is ready.

### 🧯 If Railway shows build errors

If you see:
- `Railpack could not determine how to build the app`
- `Could not open requirements file ... /app/backend/requirements.txt`

This repo includes explicit deployment config. Railway can build either:
- `Dockerfile` (recommended, deterministic build with frontend assets)
- or `railway.toml` + `build.sh` + `start.sh`

Redeploy after pulling latest changes (clear build cache if needed).

---

## 🎯 Product Goal

Deliver clear, actionable, and realistic career guidance that helps users become more hireable.
