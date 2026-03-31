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
- **Infrastrucutre**: SQLite (Local persistence), RPC API layer.

## Project Structure

- `apps/churn_dashboard/frontend/`: React application code and assets.
- `apps/churn_dashboard/backend/`: Python RPC functions and database logic.
- `apps/churn_dashboard/backend/data/db/`: SQLite database storage.
- `apps/churn_dashboard/backend/models/`: Serialized machine learning model (`churn_model.pkl`).

## Data Source

The application is initialized using the `Telco Customer Churn` dataset. Predictions are generated via a **Random Forest Classifier pipeline** that includes automated preprocessing (imputation, scaling, and encoding).

## Deployment

The app is designed to be hosted within the NextToken environment. 

1. **Build Frontend**: `cd apps/churn_dashboard/frontend && npm install && npm run build`
2. **Backend**: Ensure `requirements.txt` dependencies are installed.
3. **Launch**: Use `launch_app` to deploy the production build.

---

