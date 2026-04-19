# Churn Prediction Platform

A standalone churn analytics demo built for deployment and resume walkthroughs. The project now runs as a normal React + FastAPI application instead of depending on the original host-specific RPC runtime.

## What This Demo Shows

- A **trained Random Forest pipeline** rebuilt from the telecom churn training dataset.
- A **live React dashboard** with segment-level drilldowns, customer search, feature importance, and an ad-hoc predictor.
- An **on-demand real-time demo flow** that streams synthetic customer events through the backend and updates the UI live.
- A **container-ready deployment path** for local Docker usage and a clean frontend/backend split for public hosting.
- A **training notebook and saved model artifact** for the ML workflow used by the API.

## Architecture

### Public deployed path
- `frontend/`: Vite + React dashboard.
- `backend/`: FastAPI API that trains or loads the model, scores the historical dataset, and serves live session events.
- Live sessions are bounded by cooldowns and event caps so the demo stays cheap to host.

### Original big-data project context
The upstream project used Kafka, Spark Structured Streaming, Hadoop/HDFS, and Superset as part of the broader end-to-end architecture. That original repo is still the source of the training/demo datasets and the infrastructure story, but this cleaned repo focuses on the deployable resume demo.

See [docs/original-stack.md](docs/original-stack.md) for the upstream architecture summary and diagram carried into this repo.

## Local Setup

### Python backend with `.venv`
```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r backend/requirements.txt
python -m backend.train_model
uvicorn backend.main:app --reload
```

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

The frontend uses `http://localhost:8000` automatically through the Vite dev proxy.

## Docker

Run the standalone app with Docker Compose:

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API docs: `http://localhost:8000/docs`

The Compose file includes backend/frontend healthchecks so the frontend waits for the API to become healthy before starting.

## Model Training Assets

- Notebook: `notebooks/random_forest_pipeline.ipynb`
- Training script: `python -m backend.train_model`
- Saved production artifact: `backend/models/churn_random_forest_pipeline.pkl`

The notebook includes:

- preprocessing with imputation, scaling, and one-hot encoding
- train/test split
- evaluation metrics
- confusion matrix
- final full-dataset retraining before saving the production model artifact

## Deployment Notes

### Vercel frontend
Set the project root to `frontend/`. The repo now includes:

- `frontend/vercel.json` for SPA rewrites
- `frontend/.env.example` showing the required API base URL

Configure:

- `VITE_API_BASE_URL=https://<your-cloud-run-service-url>`

The frontend also includes a production fallback for `churnpulsedashboard.xyz` and `*.vercel.app` so the public site still reaches the deployed backend if the Vercel environment variable is missing during a build.

### Cloud Run backend
Deploy the `backend/Dockerfile` to Cloud Run. The backend container now:

- listens on Cloud Run's injected `PORT`
- ships the trained model artifact inside the image at build time
- supports bounded live-demo limits through environment variables
- builds directly from the `backend/` directory so `gcloud builds submit backend --tag ...` works on stock `gcloud`

Useful files:

- `backend/.env.example`
- `deploy/cloudrun-service.yaml`
- `scripts/deploy-cloud-run.ps1`

The deploy script writes a temporary Cloud Run env YAML file during deployment so multiple allowed origins do not require manual `gcloud` escaping on Windows.

Example deployment flow:

```powershell
gcloud auth login
gcloud config set project <your-project-id>
.\scripts\deploy-cloud-run.ps1 `
  -ProjectId <your-project-id> `
  -Region us-central1 `
  -ArtifactRepository <your-artifact-registry-repo> `
  -AllowedOrigins https://<your-vercel-project>.vercel.app
```

Recommended public-demo settings:

- `DEMO_MAX_CONCURRENT_SESSIONS=1`
- `DEMO_MAX_EVENTS=12`
- `DEMO_COOLDOWN_SECONDS=45`
- `DEMO_DURATION_SECONDS=45`
- `DEMO_EVENT_INTERVAL_SECONDS=1.1`

If you prefer a declarative deploy, update `deploy/cloudrun-service.yaml` with your image URI and allowed origins, then apply it with `gcloud run services replace`.

### Alternative backend hosts
If you want a simpler Docker host than Cloud Run, Render also supports Docker deployments directly:

- https://render.com/docs/docker

Cloud Run remains the better fit for strict scale-to-zero behavior and instance caps.

## Production URLs

- Frontend: `https://churnpulsedashboard.xyz`
- Backend: `https://churn-platform-api-247833790903.us-central1.run.app`

## Production Troubleshooting

If the UI loads but no data appears:

1. Verify the backend directly:
   - `https://churn-platform-api-247833790903.us-central1.run.app/api/health`
2. In Vercel, confirm:
   - root directory is `frontend`
   - `VITE_API_BASE_URL` is set to the Cloud Run backend URL
3. Redeploy the frontend after any Vercel environment variable change.
4. Confirm Cloud Run still allows the frontend origin through `ALLOWED_ORIGINS`.
5. Check backend logs:

```powershell
gcloud run services logs read churn-platform-api --region us-central1 --limit 100
```

The repo also includes two code-level protections against a blank-but-loaded frontend:

- `frontend/src/api.ts` falls back to the production backend on known hosted domains
- `frontend/vercel.json` rewrites `/api/*` requests to the Cloud Run backend

## Testing

Backend smoke tests:

```powershell
python -m unittest backend.tests.test_api
```

Frontend verification:

```powershell
cd frontend
npm run build
```
