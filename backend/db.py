import sqlite3
import os
import pandas as pd
import joblib
import numpy as np

DB_DIR = "apps/churn_dashboard/backend/data/db"
DB_PATH = os.path.join(DB_DIR, "churn.db")
MODEL_PATH = "apps/churn_dashboard/backend/models/churn_model.pkl"
CSV_PATH = "repo/Test_Churn.csv"

def _get_db():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    print("[BACKEND_START] init_db")
    conn = _get_db()
    try:
        # Check if table exists
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='customers'")
        if cursor.fetchone():
            print("[BACKEND_STEP] Database already initialized")
            return

        print("[BACKEND_STEP] Initializing database from CSV")
        df = pd.read_csv(CSV_PATH)
        
        # Load model and predict
        print(f"[BACKEND_STEP] Loading model from {MODEL_PATH}")
        model = joblib.load(MODEL_PATH)
        
        # Determine features from model pipeline or data
        if hasattr(model, "feature_names_in_"):
            features = model.feature_names_in_.tolist()
        else:
            # Fallback to df columns excluding customerID
            features = [c for c in df.columns if c not in ["customerID"]]
        
        print(f"[BACKEND_STEP] Features used: {features}")
        
        X = df[features]
        # In this specific case, the model is a Pipeline, so it handles its own preprocessing
        probs = model.predict_proba(X)[:, 1]
        df["probability"] = probs
        df["prediction"] = ["Yes" if p >= 0.5 else "No" for p in probs]
        
        # Save to SQLite
        df.to_sql('customers', conn, if_exists='replace', index=False)
        
        # Create segments table
        conn.execute("DROP TABLE IF EXISTS segments")
        conn.execute("CREATE TABLE segments (id TEXT PRIMARY KEY, label TEXT, category TEXT)")
        
        segments = []
        for contract in df['Contract'].unique():
            segments.append((f"contract_{contract.lower().replace(' ', '_')}", contract, "Contract"))
        for internet in df['InternetService'].unique():
            segments.append((f"internet_{internet.lower().replace(' ', '_')}", internet, "Internet Service"))
            
        conn.executemany("INSERT INTO segments (id, label, category) VALUES (?, ?, ?)", segments)
        
        conn.commit()
        print("[BACKEND_SUCCESS] Database initialized")
    except Exception as e:
        print(f"[BACKEND_ERROR] init_db failed: {e}")
        raise
    finally:
        conn.close()

def get_db_connection():
    return _get_db()
