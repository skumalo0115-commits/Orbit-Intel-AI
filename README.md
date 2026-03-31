# 🚀 Orbit Intel-AI - AI Career Intelligence Platform

<img width="1880" height="896" alt="image" src="https://github.com/user-attachments/assets/eff51d06-19e7-4cd8-9e9b-51b572e04fb5" />

An end-to-end career guidance app that lets users upload a CV, compare it to a target role, and get practical, evidence-based recommendations powered by OpenRouter.

---

## ✨ Core Features

- 🔐 Secure auth with local email/password login plus Firebase Google sign-in
- 🔄 Account recovery flows for forgot password and forgot username
- 📄 CV upload for PDF, DOCX, DOC, TXT, CSV, RTF, PNG, JPG, and JPEG
- 🧠 OpenRouter-powered career analysis using uploaded CV text, skills, target job title, and target job description
- 🎯 AI-generated top career matches with percentages, fit reasoning, and role-gap analysis
- 🛠️ CV improvement guidance with high-impact fixes, ATS keyword suggestions, and project suggestions
- 💬 Career Assistant Q&A that answers follow-up questions from the analyzed CV context
- 🌌 Modern React UI with motion effects and a single-service Railway deployment path

---

## 🧱 Tech Stack

- ⚛️ Frontend: React 18, TypeScript, Vite, TailwindCSS, Framer Motion
- 🐍 Backend: FastAPI, SQLAlchemy, JWT auth
- 🔐 Auth: Firebase Web SDK, Firebase Admin SDK
- 🤖 AI: OpenRouter chat completions
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
  services/
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

If needed, set API URL in `frontend/.env`:

```bash
VITE_API_URL=http://localhost:8000
```

### 3) Recommended Python Version

For the smoothest local setup on Windows, prefer Python `3.11` or `3.12`.
Some packages in this project are less reliable on Python `3.14`.

---

## 🔐 Authentication

Orbit Intel-AI now supports:

- Local registration with username, email, and password
- Local login with username or email plus password
- Firebase Google sign-in and sign-up
- Forgot password email flow
- Forgot username email flow
- Password reset page

### Firebase Setup

Frontend env values go in `frontend/.env`:

```bash
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

Backend env values go in `backend/.env`:

```bash
FRONTEND_APP_URL=http://localhost:5173
FIREBASE_CREDENTIALS_PATH=backend/firebase-service-account.json
FIREBASE_CREDENTIALS_JSON=
```

Use `FIREBASE_CREDENTIALS_JSON` for hosted environments like Railway.
Use `FIREBASE_CREDENTIALS_PATH` for local development if you are reading a JSON file from disk.

### Email Recovery Setup

To enable forgot-password and forgot-username emails, configure SMTP:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-app-password
SMTP_SENDER_EMAIL=your-email@example.com
SMTP_SENDER_NAME=Orbit Intel-AI
SMTP_USE_TLS=true
```

---

## 🧠 AI Analysis

The analysis flow is now designed around OpenRouter as the real analysis engine.

Inputs used for analysis:

- Uploaded CV
- Skills & Expertise
- Target Job Title
- Target Job Description

Outputs include:

- Top career matches with percentages and reasons
- Target-role fit score
- Matched and missing requirements
- High-impact CV improvement priorities
- ATS keywords to work into the CV
- Project suggestions that would improve fit
- AI Career Assistant follow-up answers grounded in the uploaded CV

### OpenRouter Environment Variables

You can configure either `OPENROUTER_*` or `OPENAI_*` names on the backend.
The app accepts both for compatibility.

```bash
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=openai/gpt-4o-mini
```

Or:

```bash
OPENAI_API_KEY=your-openrouter-key
OPENAI_MODEL=openai/gpt-4o-mini
```

If the backend cannot find one of those keys, analysis will fail with a real error instead of silently using a fake local fallback.

---

## 📡 API Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`
- `POST /auth/forgot-password`
- `POST /auth/forgot-username`
- `POST /auth/reset-password`
- `POST /upload`
- `GET /documents`
- `GET /documents/{id}`
- `DELETE /documents/{id}`
- `GET /jobs`
- `POST /analyze/{document_id}`
- `GET /analysis/{document_id}`
- `POST /ask-question/{document_id}`
- `GET /env-check`
- `GET /runtime-config.js`

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
- `DATABASE_URL` for production/Postgres

Common optional environment variables:

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `FRONTEND_APP_URL`
- `FIREBASE_CREDENTIALS_JSON`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`

Check runtime readiness:

```bash
GET /env-check
```

Expected:

- `ready: true`
- `required.SECRET_KEY: true`
- `required.DATABASE_URL: true` in production

---

## 🚂 Railway Deployment

For full step-by-step instructions, see:

- `RAILWAY_DEPLOYMENT.md`

### Deployment Model

This project is deployed as one combined Railway app service plus one PostgreSQL service:

- `Orbit-Intel-AI` service: FastAPI backend plus built frontend assets
- `Postgres` service: database only

The backend serves the frontend build and also exposes runtime config through:

- `GET /runtime-config.js`

That allows Railway environment variables such as `VITE_FIREBASE_*` and `VITE_API_URL` to be read at runtime by the deployed frontend.

### Railway Checklist

1. Push repo to GitHub.
2. Railway -> New Project -> Deploy from GitHub Repo.
3. Add PostgreSQL plugin.
4. Set app vars on the `Orbit-Intel-AI` service, not on `Postgres`.
5. Add Firebase web config vars (`VITE_FIREBASE_*`).
6. Add Firebase backend credential var (`FIREBASE_CREDENTIALS_JSON`).
7. Add OpenRouter key/model vars.
8. Add SMTP vars if you want recovery emails to work.
9. Redeploy and confirm `/env-check` and `/runtime-config.js` look correct.

### 🧯 If Railway Shows Build Errors

This repo includes explicit deployment config through:

- `Dockerfile`
- `railway.toml`
- `build.sh`
- `start.sh`

If Railway behaves inconsistently, redeploy after pulling the latest changes and clear the build cache if needed.

---

## 🎯 Product Goal

Deliver clear, actionable, and realistic career guidance that helps users become more hireable for their target role.
