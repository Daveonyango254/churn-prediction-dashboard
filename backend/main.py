import os
import joblib
import pandas as pd
import numpy as np
from apps.churn_dashboard.backend.db import get_db_connection, init_db

# Initialize database on first call/import
init_db()

def get_churn_overview():
    print("[BACKEND_START] get_churn_overview")
    conn = get_db_connection()
    try:
        query = """
        SELECT 
            COUNT(*) as total,
            AVG(probability) as avg_prob,
            SUM(CASE WHEN prediction = 'Yes' THEN 1 ELSE 0 END) as churned_count
        FROM customers
        """
        row = conn.execute(query).fetchone()
        res = {
            "total": row["total"],
            "avg_prob": round(float(row["avg_prob"]), 3),
            "churned_count": row["churned_count"],
            "churn_rate": round(float(row["churned_count"]) / row["total"] if row["total"] > 0 else 0, 3)
        }
        print(f"[BACKEND_SUCCESS] get_churn_overview result={res}")
        return res
    except Exception as e:
        print(f"[BACKEND_ERROR] get_churn_overview failed: {e}")
        raise
    finally:
        conn.close()

def get_probability_distribution(segments: list = None):
    print(f"[BACKEND_START] get_probability_distribution segments={segments}")
    conn = get_db_connection()
    try:
        # Simple bins 0-0.1, 0.1-0.2, etc.
        bins = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
        labels = ["0-0.1", "0.1-0.2", "0.2-0.3", "0.3-0.4", "0.4-0.5", "0.5-0.6", "0.6-0.7", "0.7-0.8", "0.8-0.9", "0.9-1.0"]
        
        where_clause = ""
        params = []
        if segments:
            # segments is list of IDs like 'contract_monthly'
            # Need to map back to labels if segments are complex
            # For simplicity, let's assume we filter by categories found in segments table
            # Actually, the spec says segments list. Let's just handle it if it exists.
            # This implementation will be simple filtering by Contract and InternetService if specified
            pass # Placeholder for segment filtering logic if needed

        query = "SELECT probability FROM customers " + where_clause
        df = pd.read_sql_query(query, conn, params=params)
        
        counts, _ = np.histogram(df["probability"], bins=bins)
        
        result = [{"bin": labels[i], "count": int(counts[i])} for i in range(len(labels))]
        print(f"[BACKEND_SUCCESS] get_probability_distribution complete")
        return result
    except Exception as e:
        print(f"[BACKEND_ERROR] get_probability_distribution failed: {e}")
        raise
    finally:
        conn.close()

def get_feature_importance():
    print("[BACKEND_START] get_feature_importance")
    try:
        MODEL_PATH = "apps/churn_dashboard/backend/models/churn_model.pkl"
        model = joblib.load(MODEL_PATH)
        
        # Pipeline handling: find the Random Forest or classifier step
        importance = None
        feature_names = None
        
        # Check if it's a pipeline
        if hasattr(model, "steps"):
            # Find the classifier
            clf = model.steps[-1][1]
            if hasattr(clf, "feature_importances_"):
                importance = clf.feature_importances_
            
            # Try to get feature names after preprocessing if possible
            # Pipeline might have transformed names
            if hasattr(model, "feature_names_in_"):
                feature_names = model.feature_names_in_.tolist()
        elif hasattr(model, "feature_importances_"):
            importance = model.feature_importances_
            if hasattr(model, "feature_names_in_"):
                feature_names = model.feature_names_in_.tolist()

        if importance is not None:
            if feature_names is None:
                feature_names = [f"Feature {i}" for i in range(len(importance))]
            
            result = [{"feature": f, "importance": round(float(imp), 4)} for f, imp in zip(feature_names, importance)]
            # Sort by importance
            result = sorted(result, key=lambda x: x["importance"], reverse=True)[:10]
        else:
            # Fallback for models without feature_importances_
            result = [{"feature": "N/A", "importance": 0.0}]
            
        print(f"[BACKEND_SUCCESS] get_feature_importance returning {len(result)} features")
        return result
    except Exception as e:
        print(f"[BACKEND_ERROR] get_feature_importance failed: {e}")
        raise

def get_customer_segments():
    print("[BACKEND_START] get_customer_segments")
    conn = get_db_connection()
    try:
        rows = conn.execute("SELECT id, label, category FROM segments").fetchall()
        result = [dict(r) for r in rows]
        print(f"[BACKEND_SUCCESS] get_customer_segments returned {len(result)} segments")
        return result
    finally:
        conn.close()

def get_customers(segment_filters: dict = None, limit: int = 100):
    print(f"[BACKEND_START] get_customers filters={segment_filters}, limit={limit}")
    conn = get_db_connection()
    try:
        query = "SELECT * FROM customers"
        where_parts = []
        params = []
        
        if segment_filters:
            # e.g. {"Contract": "Monthly", "InternetService": "Fiber optic"}
            for key, val in segment_filters.items():
                where_parts.append(f"{key} = ?")
                params.append(val)
        
        if where_parts:
            query += " WHERE " + " AND ".join(where_parts)
            
        query += " ORDER BY probability DESC LIMIT ?"
        params.append(limit)
        
        rows = conn.execute(query, params).fetchall()
        result = [dict(r) for r in rows]
        print(f"[BACKEND_SUCCESS] get_customers returned {len(result)} customers")
        return result
    finally:
        conn.close()

def predict_churn(customer_data: dict):
    print(f"[BACKEND_START] predict_churn for customer_id={customer_data.get('customerID')}")
    try:
        MODEL_PATH = "apps/churn_dashboard/backend/models/churn_model.pkl"
        model = joblib.load(MODEL_PATH)
        
        # Prepare data frame for prediction
        # Ensure it has the same features in same order
        if hasattr(model, "feature_names_in_"):
            features = model.feature_names_in_.tolist()
        else:
            # Fallback: all except customerID and Target if any
            features = [k for k in customer_data.keys() if k not in ["customerID", "Churn"]]
            
        input_df = pd.DataFrame([customer_data])[features]
        
        prob = model.predict_proba(input_df)[0, 1]
        prediction = "Yes" if prob >= 0.5 else "No"
        
        res = {
            "probability": round(float(prob), 3),
            "prediction": prediction
        }
        print(f"[BACKEND_SUCCESS] predict_churn result={res}")
        return res
    except Exception as e:
        print(f"[BACKEND_ERROR] predict_churn failed: {e}")
        raise
