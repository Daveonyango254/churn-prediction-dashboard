# Churn Intelligence Dashboard

A real-time analytics platform for customer churn prediction, built with React (frontend) and Python (backend). This application provides deep insights into customer behavioral patterns, risk distributions, and feature importance using a trained machine learning model.

## Features

- **Interactive Dashboard**: High-level KPIs including Churn Rate, Average Risk Score, and Total Customers.
- **Risk Distribution**: Histogram showing the distribution of churn probabilities across the customer base.
- **Key Drivers**: Feature importance visualization identifying factors with the highest statistical impact on churn.
- **Customer Risk Registry**: Searchable and filterable list of individual customer profiles with their specific risk scores.
- **Real-time Predictor**: Instant churn probability generator for individual customer attributes.
- **Segment Exploration**: Global filters for Contract Type, Internet Service, and more to drill down into specific cohorts.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend**: Python 3.13, SQLite, Scikit-Learn, Pandas, NumPy, Joblib.
- **Infrastructure**: SQLite (Local persistence), RPC API layer.

## Project Structure

- `frontend/`: React application code and assets.
- `backend/`: Python RPC functions and database logic.
- `backend/data/db/`: SQLite database storage.
- `backend/models/`: Serialized machine learning model (`churn_model.pkl`).

## Data Source

The application is initialized using the `Telco Customer Churn` dataset. Predictions are generated via a Random Forest Classifier pipeline that includes automated preprocessing (imputation, scaling, and encoding).

## Deployment

### Option 1: Docker (Recommended)
Run the entire stack using Docker Compose:
```bash
docker-compose up --build
```
The app will be accessible at `http://localhost:8000`.

### Option 2: Local Manual Setup
1. **Build Frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. **Setup Backend**:
   - Ensure Python 3.13 is installed.
   - Install dependencies: `pip install -r backend/requirements.txt`
3. **Run**:
   - Use a production server to serve the `backend/main.py` and static files in `frontend/dist`.

---
Built with NextToken AI.
