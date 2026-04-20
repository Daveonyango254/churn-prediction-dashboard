# Churn Prediction Platform

This project is a deployable churn analytics application built around a trained Random Forest pipeline and a live dashboard for exploring customer risk.

Live dashboard: https://churnpulsedashboard.xyz/

## Overview

The application combines:

- a React dashboard for segment-level analysis, customer search, and ad-hoc prediction
- a FastAPI backend for historical analytics, live scoring, and API access
- a saved Random Forest pipeline trained on telecom churn data
- a lightweight public deployment path designed for reliability and cost control

The broader project background includes Kafka, Spark Structured Streaming, Hadoop, and containerized data workflows. This repository focuses on the cleaned, deployable product version of that work.

## Stack

- Frontend: React, TypeScript, Vite
- Backend: FastAPI, Python
- Model: scikit-learn Random Forest pipeline
- Deployment: Vercel for the frontend, Cloud Run for the backend

## Repository Structure

- `frontend/` React dashboard
- `backend/` API, model loading, live demo session logic, and training utilities
- `notebooks/random_forest_pipeline.ipynb` model training and evaluation notebook
- `docs/original-stack.md` short summary of the larger upstream big-data architecture

## Local Development

Backend:

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r backend/requirements.txt
python -m backend.train_model
uvicorn backend.main:app --reload
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

## Model Assets

- Training notebook: `notebooks/random_forest_pipeline.ipynb`
- Training entry point: `python -m backend.train_model`
- Saved model artifact: `backend/models/churn_random_forest_pipeline.pkl`

The notebook includes preprocessing, train/test split, evaluation metrics, and confusion matrix output before saving the production artifact.

## Deployment

- Frontend: `https://churnpulsedashboard.xyz/`

Deployment scripts and configuration are included in the repository for the current Vercel and Cloud Run setup.

## Notes

This README is intentionally brief. Detailed design notes, deployment reasoning, and implementation tradeoffs are maintained in a private design document.
