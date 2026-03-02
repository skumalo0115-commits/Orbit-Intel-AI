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
- 🤖 Built-in AI pipeline for CV and role-fit analysis

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
cp backend/.env.example backend/.env
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

- Built-in AI analysis runs locally in the backend and does not require external LLM keys.
- Use `GET /env-check` to verify required environment variables are set (returns booleans only, never secret values).

### If `/analyze/{id}` fails

1. Call `GET /env-check` and confirm `ready` is `true`.
2. Verify your uploaded file type is supported and readable (PDF, DOCX, DOC, TXT, CSV, RTF, PNG, JPG/JPEG).
3. Restart backend locally or redeploy on Railway after any env variable change.

---

## 📌 Product Goal

Deliver fast, clear, and actionable AI career intelligence that helps users become more hireable for their target industry.


## 🚂 Deploy to Railway (Step by Step)

1. Push this repository to GitHub.
2. In Railway, create a **New Project** → **Deploy from GitHub Repo**.
3. Add environment variables in Railway service settings:
   - `SECRET_KEY`
   - `DATABASE_URL`
4. Deploy and open your service URL.
5. Run a quick readiness check: `GET /env-check`
   - `ready: true` means required variables are present.
6. Upload a CV and open Analysis page to confirm role matches and summary output.
