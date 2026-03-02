# Railway deployment (baby steps)

This project deploys as **one Railway service**:
- FastAPI backend
- React frontend static build served by FastAPI (`frontend/dist`)

## 1) Clean your repo before deploy
Use commands for your shell.

### PowerShell (Windows)
```powershell
# 1) Deactivate virtual env if active
if (Get-Command deactivate -ErrorAction SilentlyContinue) { deactivate }

# 2) Stop Python processes that may lock .venv files
Get-Process python, uvicorn -ErrorAction SilentlyContinue | Stop-Process -Force

# 3) Remove folders only if they exist (prevents "path not found" errors)
$paths = @("frontend/node_modules", "frontend/dist", ".venv")
foreach ($p in $paths) {
  if (Test-Path $p) { Remove-Item -Recurse -Force $p -ErrorAction SilentlyContinue }
}

# 4) Remove Python cache folders
Get-ChildItem -Recurse -Directory -Filter __pycache__ -ErrorAction SilentlyContinue |
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
```

If `.venv` is still locked, close all terminals/VS Code Python sessions and run:
```powershell
cmd /c rmdir /s /q .venv
```


### If you see: "The system cannot find the file specified"
That usually means the folder/file is already gone (for example `.venv` was already deleted).

Use safe checks before delete:

```powershell
if (Test-Path .venv) { Remove-Item -Recurse -Force .venv }
if (Test-Path frontend/node_modules) { Remove-Item -Recurse -Force frontend/node_modules }
if (Test-Path frontend/dist) { Remove-Item -Recurse -Force frontend/dist }
```

This is not a deployment blocker—just continue to the next step.

### Bash (macOS/Linux/Git Bash)
```bash
rm -rf frontend/node_modules frontend/dist .venv
find . -type d -name "__pycache__" -prune -exec rm -rf {} +
```

Do **not** commit local `.env` files.

## 2) Required files for Railway (already in this repo)
- `Dockerfile` (recommended, deterministic Python + frontend build)
- `requirements.txt` at repo root
- `railway.toml` / `build.sh` / `start.sh` (fallback path)
- `Procfile` (legacy fallback)

## 3) Push code to GitHub
```bash
git add .
git commit -m "Prepare Railway deploy"
git push
```

## 4) Create Railway project
1. Open Railway dashboard
2. **New Project**
3. **Deploy from GitHub Repo**
4. Select this repository

## 5) Add PostgreSQL plugin
1. In Railway project, click **+ New**
2. Add **PostgreSQL**
3. Copy its `DATABASE_URL`

## 6) Set web service variables
Set these in Railway service Variables:
- `SECRET_KEY` = long random value
- `DATABASE_URL` = value from PostgreSQL plugin

That’s all required for this built-in AI setup.

## 7) Deploy and verify
After deployment finishes:
1. Open your Railway public URL
2. Register/login
3. Upload CV
4. Open analysis page

## 8) Health check
Call:

```bash
GET /env-check
```

Expect:
- `ready: true`
- `required.SECRET_KEY: true`
- `required.DATABASE_URL: true`

## 9) If deploy fails
- Confirm `DATABASE_URL` exists on the web service
- Confirm `SECRET_KEY` exists
- Redeploy after variable updates
- Check Railway logs for startup/build errors


## 10) If Railway log says "Railpack could not determine how to build the app"
This repo now includes explicit build/start config for Railpack:
- `railway.toml`
- `build.sh`
- `start.sh`
- root `requirements.txt`

If you still see the old error:
1. In Railway, open your service settings.
2. Trigger **Redeploy** (or clear build cache and redeploy).
3. Confirm deploy logs show `bash ./build.sh` then `bash ./start.sh`.


## 11) If you see `Could not open requirements file: /app/backend/requirements.txt`
This happens when Railway builds from a root where `backend/requirements.txt` is not visible.

This repo now includes a root `requirements.txt` with direct dependencies and a `build.sh` fallback:
- tries `backend/requirements.txt` when present
- otherwise uses root `requirements.txt`

Redeploy after pulling latest changes.
