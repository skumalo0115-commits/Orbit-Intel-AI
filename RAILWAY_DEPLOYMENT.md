# Railway deployment — baby steps (very detailed)

This guide is written for a first-time deploy.

---

## 0) What this app does in production
You deploy **one Railway web service** that serves:
- FastAPI backend (API)
- React frontend static build (`frontend/dist`) from the same URL

So users open one URL and both UI + API work together.

---

## Security warning (important)
If an API key is ever shared in chat, screenshots, git commits, or logs, treat it as compromised:
1. Revoke/delete that key in OpenAI dashboard.
2. Create a new key.
3. Update Railway `OPENAI_API_KEY` with the new key.
4. Redeploy.

---

## 1) Before you deploy (clean your repo)
Delete these local/generated folders/files **before pushing**:

1. `frontend/node_modules/`
2. `frontend/dist/`
3. any `__pycache__/` folder (for example `backend/__pycache__/`)
4. `.venv/`
5. local `.env` files with machine-specific secrets

Optional (only needed for local Docker, not Railway):
6. `docker-compose.yml`

Why: these files are generated locally and can break or slow cloud builds.

---

## 2) Push your code to GitHub
1. Commit your latest changes.
2. Push the branch to GitHub.

Railway will pull code from GitHub.

---

## 3) Create project in Railway
1. Open Railway dashboard.
2. Click **New Project**.
3. Choose **Deploy from GitHub Repo**.
4. Select this repository.

Railway will detect `nixpacks.toml` and use it automatically.

---

## 4) Add PostgreSQL database
1. In Railway project, click **+ New**.
2. Add **PostgreSQL** plugin.
3. Open Postgres plugin variables.
4. Copy the connection URL.

You will put this value in `DATABASE_URL` on the web service.

---

## 5) Configure required environment variables (web service)
Set these variables in your web service:

- `DATABASE_URL` = Postgres connection URL from step 4
- `SECRET_KEY` = long random secret (example: 64+ chars)
- `AI_FAST_MODE` = `1`
- `OPENAI_API_KEY` = your OpenAI key (**required for analysis page now**)
- `OPENAI_MODEL` = `gpt-4o-mini` (or another model you enabled)

Important:
- Analysis page is configured to use ChatGPT for all analysis results.
- If `OPENAI_API_KEY` is missing, analysis endpoint returns a 503 error with a clear message.

---

## 6) Build & start behavior on Railway
Railway uses:
- `nixpacks.toml` to install/build
- `Procfile` fallback start command

Start command is:
- `uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}`

---

## 7) First deployment check (smoke test)
After deploy finishes, open your Railway public URL and verify:

1. Landing page loads.
2. Register/Login works.
3. Upload CV works.
4. Go to analysis page and confirm it returns ChatGPT-generated results.

If analysis fails, check logs for:
- missing `OPENAI_API_KEY`
- OpenAI quota/permission/model issues
- database connection errors

---

## 8) If frontend looks stale after redeploy
1. Trigger a new deploy.
2. Hard refresh browser (`Ctrl+Shift+R` / `Cmd+Shift+R`).

Because frontend is built during deploy, stale cache can show older UI briefly.

---

## 9) Quick troubleshooting
- **Error: OPENAI_API_KEY is required**
  - Add `OPENAI_API_KEY` in Railway variables and redeploy.

- **500/503 on analysis**
  - Check Railway logs for OpenAI API response errors.
  - Verify `OPENAI_MODEL` is valid for your key.

- **Database errors**
  - Re-check `DATABASE_URL` points to Railway Postgres.

