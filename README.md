![Orbit Intel-AI Home Page](https://wallstreetpit.com/wp-content/uploads/news/ai-cg/AI5-G.jpg)

# 🚀 Orbit Intel-AI — AI Career Intelligence Platform

A futuristic, full-stack AI career guidance platform that analyzes CVs and profile context to recommend realistic role matches, hiring-readiness insights, and practical improvement plans.

---

## ✨ What this project does

- 🔐 **Authentication** (register/login with JWT)
- 📄 **CV Upload** (PDF, DOCX, DOC, TXT, CSV, RTF, PNG, JPG, JPEG)
- 🧠 **AI Career Analysis** (top 3 role matches with confidence scores)
- 🧭 **Career Suggestion Summary** (hireability, strengths, improvement priorities, 30/60/90 plan)
- 🪄 **Interactive Frontend UX** (animated cards, loaders, smooth typewriter text)

---

## 🧱 Tech Stack

### Frontend
- ⚛️ React 18 + TypeScript
- ⚡ Vite
- 🎨 TailwindCSS
- 🎬 Framer Motion
- 🌐 Axios + React Router

### Backend
- 🐍 FastAPI
- 🗄️ SQLAlchemy
- 🔒 JWT Auth
- 🤖 Heuristic + optional model-assisted AI pipeline

### Database
- 🧩 SQLite by default (`sqlite:///./nebulaglass.db`)
- 🐘 PostgreSQL supported via `DATABASE_URL`

---

## 📁 Project Structure

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

## 🧠 AI Analysis Logic (High Level)

1. Upload CV/document.
2. Extract text (on-demand at analysis time).
3. Score CV against a broad corporate role map.
4. Blend CV signals + dashboard profile context (skills/interests).
5. Return:
   - Top 3 role cards with percentage confidence.
   - AI career summary focused on **hireability improvements**.

---

## 🛠️ Local Development

## 1) Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cp backend/.env.example .env
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:

```bash
curl http://localhost:8000/
```

## 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev -- --host 0.0.0.0 --port 5173
```

Open: `http://localhost:5173`

Set API URL in `frontend/.env`:

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

## ⚙️ Configuration Notes

- `AI_FAST_MODE=1` (default): fast heuristic analysis mode.
- `AI_FAST_MODE=0`: enables slower heavy model paths where available.

---

## 📌 Product Goal

Deliver fast, clear, and actionable AI career intelligence that helps users become more hireable for their target industry.
