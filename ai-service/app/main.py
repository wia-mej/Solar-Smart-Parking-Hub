"""
API du service IA - Solar Smart Parking Hub.

Expose deux endpoints de prediction, bases sur les modeles entraines par
train_model.py (voir app/training/). Version V1 : pas de lags (valeurs
recentes), uniquement meteo prevue + contexte temporel -- a enrichir une
fois le backend/MongoDB operationnel (S3-S4).

Metriques Prometheus exposees sur /metrics :
- Latence + nombre de requetes par endpoint (auto, via Instrumentator)
- predictions_total{type, status} : compteur de predictions par type et issue
- model_mae{model} / model_rmse{model} : erreur du modele mesuree a l'entrainement
"""

import json
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from prometheus_client import Counter, Gauge
from prometheus_fastapi_instrumentator import Instrumentator
from pydantic import BaseModel

app = FastAPI(title="Solar Smart Parking Hub - AI Service")

# Chemin vers les modeles entraines (relatif au dossier ai-service/)
MODEL_DIR = "app/model"
HUBS_CONNUS = ["hub_casablanca", "hub_rabat", "hub_tanger", "hub_marrakech"]

# --- Metriques Prometheus ---------------------------------------------
predictions_total = Counter(
    "predictions_total",
    "Nombre total de predictions effectuees",
    ["type", "status"],
)

model_mae = Gauge(
    "model_mae",
    "MAE du modele mesure lors de l'entrainement (validation temporelle)",
    ["model"],
)

model_rmse = Gauge(
    "model_rmse",
    "RMSE du modele mesure lors de l'entrainement (validation temporelle)",
    ["model"],
)

# Instrumentation automatique : latence + nb requetes par endpoint, exposees sur /metrics
Instrumentator().instrument(app).expose(app)


def load_model(prefix: str):
    model = joblib.load(f"{MODEL_DIR}/{prefix}.pkl")
    with open(f"{MODEL_DIR}/{prefix}_columns.json") as f:
        meta = json.load(f)
    return model, meta["feature_columns"], meta.get("mae"), meta.get("rmse")


try:
    model_production, columns_production, mae_production, rmse_production = load_model("model_production")
    model_disponibilite, columns_disponibilite, mae_disponibilite, rmse_disponibilite = load_model(
        "model_disponibilite"
    )

    if mae_production is not None:
        model_mae.labels(model="production").set(mae_production)
        model_rmse.labels(model="production").set(rmse_production)
    if mae_disponibilite is not None:
        model_mae.labels(model="disponibilite").set(mae_disponibilite)
        model_rmse.labels(model="disponibilite").set(rmse_disponibilite)

except FileNotFoundError as e:
    print(f"[AVERTISSEMENT] Modeles non charges : {e}")
    model_production, columns_production = None, None
    model_disponibilite, columns_disponibilite = None, None


def build_time_features(timestamp: datetime) -> dict:
    heure, mois = timestamp.hour, timestamp.month
    return {
        "heure_sin": np.sin(2 * np.pi * heure / 24),
        "heure_cos": np.cos(2 * np.pi * heure / 24),
        "mois_sin": np.sin(2 * np.pi * mois / 12),
        "mois_cos": np.cos(2 * np.pi * mois / 12),
        "est_weekend": int(timestamp.weekday() >= 5),
        "jour_semaine": timestamp.weekday(),
    }


def encode_hub(hub_id: str, feature_columns: list) -> dict:
    return {col: int(col == f"hub_{hub_id}") for col in feature_columns if col.startswith("hub_")}


class PredictionProductionRequest(BaseModel):
    hub_id: str
    timestamp: datetime
    radiation_wm2: float
    temperature_c: float


class PredictionDisponibiliteRequest(BaseModel):
    hub_id: str
    timestamp: datetime


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_production_charge": model_production is not None,
        "model_disponibilite_charge": model_disponibilite is not None,
    }


@app.post("/predict/production")
def predict_production(req: PredictionProductionRequest):
    if model_production is None:
        predictions_total.labels(type="production", status="error").inc()
        raise HTTPException(status_code=503, detail="Modele de production non charge (entrainez-le d'abord)")
    if req.hub_id not in HUBS_CONNUS:
        predictions_total.labels(type="production", status="error").inc()
        raise HTTPException(status_code=400, detail=f"hub_id inconnu. Attendu parmi : {HUBS_CONNUS}")

    try:
        features = {
            "radiation_wm2": req.radiation_wm2,
            "temperature_c": req.temperature_c,
            **build_time_features(req.timestamp),
            **encode_hub(req.hub_id, columns_production),
        }
        X = pd.DataFrame([features])[columns_production]
        prediction = float(model_production.predict(X)[0])
    except Exception:
        predictions_total.labels(type="production", status="error").inc()
        raise

    predictions_total.labels(type="production", status="success").inc()

    return {
        "hub_id": req.hub_id,
        "timestamp": req.timestamp,
        "production_solaire_predite_kw": max(0.0, round(prediction, 3)),
    }


@app.post("/predict/disponibilite")
def predict_disponibilite(req: PredictionDisponibiliteRequest):
    if model_disponibilite is None:
        predictions_total.labels(type="disponibilite", status="error").inc()
        raise HTTPException(status_code=503, detail="Modele de disponibilite non charge (entrainez-le d'abord)")
    if req.hub_id not in HUBS_CONNUS:
        predictions_total.labels(type="disponibilite", status="error").inc()
        raise HTTPException(status_code=400, detail=f"hub_id inconnu. Attendu parmi : {HUBS_CONNUS}")

    try:
        features = {
            **build_time_features(req.timestamp),
            **encode_hub(req.hub_id, columns_disponibilite),
        }
        X = pd.DataFrame([features])[columns_disponibilite]
        prediction = float(model_disponibilite.predict(X)[0])
    except Exception:
        predictions_total.labels(type="disponibilite", status="error").inc()
        raise

    predictions_total.labels(type="disponibilite", status="success").inc()

    return {
        "hub_id": req.hub_id,
        "timestamp": req.timestamp,
        "disponibilite_bornes_predite_pct": round(min(100.0, max(0.0, prediction)), 1),
    }