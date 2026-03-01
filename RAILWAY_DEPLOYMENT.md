# Railway deployment checklist

## Required runtime for this repo
This repository is configured to run as a **single Railway service**:
- Backend API (FastAPI)
- Frontend static build (`frontend/dist`) served by FastAPI

Railway will use:
- `nixpacks.toml` for install/build/start
- `Procfile` fallback start command

## Environment variables to set in Railway
- `DATABASE_URL` (PostgreSQL connection string from Railway Postgres plugin)
- `SECRET_KEY` (strong random string)
- `AI_FAST_MODE=1`

## Exactly what to delete / not deploy
To avoid failed builds and bloated deployments, remove these from your Git repo and/or deploy context:

1. `frontend/node_modules/`
2. `frontend/dist/`
3. `backend/__pycache__/` and any `__pycache__/` folders
4. `.venv/`
5. local `.env` files containing machine-specific values
6. Docker-only local files if you are deploying only on Railway:
   - `docker-compose.yml` (optional for local dev, not needed by Railway)

## Deploy steps
1. Push this branch to GitHub.
2. In Railway: **New Project → Deploy from GitHub Repo**.
3. Add a PostgreSQL plugin, copy its connection URL into `DATABASE_URL`.
4. Add environment variables listed above.
5. Deploy.

If deployment succeeds, your app will serve frontend and backend from the same Railway URL.
