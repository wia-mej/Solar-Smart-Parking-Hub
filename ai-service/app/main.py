"""
API du service IA - Solar Smart Parking Hub.
 
Expose deux endpoints de prediction, bases sur les modeles entraines par
train_model.py (voir app/training/). Version V1 : pas de lags (valeurs
recentes), uniquement meteo prevue + contexte temporel -- a enrichir une
fois le backend/MongoDB operationnel (S3-S4).
"""
 
import json
from datetime import datetime
 
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
 
app = FastAPI(title="Solar Smart Parking Hub - AI Service")
 
# Chemin vers les modeles entraines (relatif au dossier ai-service/)
MODEL_DIR = "app/model"
HUBS_CONNUS = ["hub_casablanca", "hub_rabat", "hub_tanger", "hub_marrakech"]
 
 
def load_model(prefix: str):
    model = joblib.load(f"{MODEL_DIR}/{prefix}.pkl")
    with open(f"{MODEL_DIR}/{prefix}_columns.json") as f:
        meta = json.load(f)
    return model, meta["feature_columns"]
 
 
try:
    model_production, columns_production = load_model("model_production")
    model_disponibilite, columns_disponibilite = load_model("model_disponibilite")
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
        raise HTTPException(status_code=503, detail="Modele de production non charge (entrainez-le d'abord)")
    if req.hub_id not in HUBS_CONNUS:
        raise HTTPException(status_code=400, detail=f"hub_id inconnu. Attendu parmi : {HUBS_CONNUS}")
 
    features = {
        "radiation_wm2": req.radiation_wm2,
        "temperature_c": req.temperature_c,
        **build_time_features(req.timestamp),
        **encode_hub(req.hub_id, columns_production),
    }
    X = pd.DataFrame([features])[columns_production]
    prediction = float(model_production.predict(X)[0])
 
    return {
        "hub_id": req.hub_id,
        "timestamp": req.timestamp,
        "production_solaire_predite_kw": max(0.0, round(prediction, 3)),
    }
 
 
@app.post("/predict/disponibilite")
def predict_disponibilite(req: PredictionDisponibiliteRequest):
    if model_disponibilite is None:
        raise HTTPException(status_code=503, detail="Modele de disponibilite non charge (entrainez-le d'abord)")
    if req.hub_id not in HUBS_CONNUS:
        raise HTTPException(status_code=400, detail=f"hub_id inconnu. Attendu parmi : {HUBS_CONNUS}")
 
    features = {
        **build_time_features(req.timestamp),
        **encode_hub(req.hub_id, columns_disponibilite),
    }
    X = pd.DataFrame([features])[columns_disponibilite]
    prediction = float(model_disponibilite.predict(X)[0])
 
    return {
        "hub_id": req.hub_id,
        "timestamp": req.timestamp,
        "disponibilite_bornes_predite_pct": round(min(100.0, max(0.0, prediction)), 1),
    }
