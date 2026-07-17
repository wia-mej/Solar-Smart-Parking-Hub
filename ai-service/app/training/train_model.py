"""
Entraine et compare 3 modeles de regression (Ridge, RandomForest, XGBoost)
pour chacune des deux cibles (production solaire, disponibilite des bornes),
avec une validation croisee temporelle (TimeSeriesSplit) pour eviter toute
fuite de donnees entre passe et futur.

Le meilleur modele par cible (au sens du RMSE moyen sur les plis de test)
est ensuite reentraine sur l'integralite des donnees et sauvegarde dans
app/model/, pret a etre charge par l'API FastAPI (/predict).

Sorties :
- app/model/model_production.pkl + model_production_columns.json
- app/model/model_disponibilite.pkl + model_disponibilite_columns.json
- Un tableau comparatif MAE/RMSE affiche dans le terminal
"""

import json
import os

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import TimeSeriesSplit
from xgboost import XGBRegressor

N_SPLITS = 5
RANDOM_STATE = 42


def load_and_encode(path: str, target_col: str):
    """Charge un CSV de features, trie chronologiquement (tous hubs confondus,
    indispensable pour un TimeSeriesSplit correct), et encode hub_station_id
    en variables indicatrices (one-hot)."""
    df = pd.read_csv(path, parse_dates=["timestamp"])
    df = df.sort_values("timestamp").reset_index(drop=True)

    df = pd.get_dummies(df, columns=["hub_station_id"], prefix="hub")

    drop_cols = ["timestamp", target_col]
    feature_cols = [c for c in df.columns if c not in drop_cols]

    X = df[feature_cols]
    y = df[target_col]
    return X, y, feature_cols


def evaluate_model(model, X: pd.DataFrame, y: pd.Series):
    """Cross-validation temporelle : retourne le MAE et le RMSE moyens
    sur les N_SPLITS derniers plis (jamais de melange passe/futur)."""
    tscv = TimeSeriesSplit(n_splits=N_SPLITS)
    mae_scores, rmse_scores = [], []

    for train_idx, test_idx in tscv.split(X):
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        mae_scores.append(mean_absolute_error(y_test, preds))
        rmse_scores.append(np.sqrt(mean_squared_error(y_test, preds)))

    return np.mean(mae_scores), np.mean(rmse_scores)


def compare_models(X: pd.DataFrame, y: pd.Series, label: str):
    models = {
        "Ridge": Ridge(alpha=1.0),
        "RandomForest": RandomForestRegressor(n_estimators=200, max_depth=8, random_state=RANDOM_STATE, n_jobs=-1),
        "XGBoost": XGBRegressor(n_estimators=300, max_depth=4, learning_rate=0.05, random_state=RANDOM_STATE),
    }

    print(f"\n=== Comparaison des modeles : {label} ===")
    print(f"{'Modele':<15} {'MAE':>10} {'RMSE':>10}")

    results = {}
    for name, model in models.items():
        mae, rmse = evaluate_model(model, X, y)
        results[name] = {"model": model, "mae": mae, "rmse": rmse}
        print(f"{name:<15} {mae:>10.3f} {rmse:>10.3f}")

    best_name = min(results, key=lambda n: results[n]["rmse"])
    print(f"-> Modele retenu : {best_name} (RMSE le plus bas)")
    return best_name, results[best_name]["model"]


def train_and_save(path: str, target_col: str, label: str, output_prefix: str):
    X, y, feature_cols = load_and_encode(path, target_col)
    best_name, best_model = compare_models(X, y, label)

    # reentrainement final sur l'integralite des donnees disponibles
    best_model.fit(X, y)

    os.makedirs("../model", exist_ok=True)
    joblib.dump(best_model, f"../model/{output_prefix}.pkl")
    with open(f"../model/{output_prefix}_columns.json", "w") as f:
        json.dump({"model_name": best_name, "feature_columns": feature_cols}, f, indent=2)

    print(f"Modele sauvegarde : app/model/{output_prefix}.pkl")


if __name__ == "__main__":
    train_and_save(
        path="data/features_production.csv",
        target_col="production_actuelle_kw",
        label="Production solaire",
        output_prefix="model_production",
    )

    train_and_save(
        path="data/features_disponibilite.csv",
        target_col="disponibilite_bornes_pct",
        label="Disponibilite des bornes",
        output_prefix="model_disponibilite",
    )