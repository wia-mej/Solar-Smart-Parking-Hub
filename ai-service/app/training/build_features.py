"""
Feature engineering pour les deux modeles de prediction :
1. Production solaire (a partir de production_energie_reelle.csv)
2. Disponibilite des bornes (a partir de sessions_charge.csv)
 
Sorties :
- data/features_production.csv
- data/features_disponibilite.csv
 
Ces deux fichiers sont ensuite consommes par le script d'entrainement
(comparaison Ridge / RandomForest / XGBoost avec TimeSeriesSplit).
"""
 
import numpy as np
import pandas as pd
 
CAPACITE_PAR_HUB = {
    "hub_casablanca": {"kwc": 29.76, "n_bornes": 6},
    "hub_rabat": {"kwc": 29.76, "n_bornes": 6},
    "hub_tanger": {"kwc": 29.76, "n_bornes": 4},
    "hub_marrakech": {"kwc": 29.76, "n_bornes": 6},
}
 
 
def add_time_features(df: pd.DataFrame, ts_col: str = "timestamp") -> pd.DataFrame:
    df = df.copy()
    df["heure"] = df[ts_col].dt.hour
    df["mois"] = df[ts_col].dt.month
    df["jour_semaine"] = df[ts_col].dt.dayofweek
    df["est_weekend"] = (df["jour_semaine"] >= 5).astype(int)
    df["heure_sin"] = np.sin(2 * np.pi * df["heure"] / 24)
    df["heure_cos"] = np.cos(2 * np.pi * df["heure"] / 24)
    df["mois_sin"] = np.sin(2 * np.pi * df["mois"] / 12)
    df["mois_cos"] = np.cos(2 * np.pi * df["mois"] / 12)
    return df
 
 
def build_features_production(path_in: str = "data/production_energie_reelle.csv",
                              path_out: str = "data/features_production.csv") -> pd.DataFrame:
    df = pd.read_csv(path_in, parse_dates=["timestamp"])
    df = df.sort_values(["hub_station_id", "timestamp"]).reset_index(drop=True)
    df = add_time_features(df)
 
    # NB : pas de lags (valeurs recentes) ici volontairement -- au moment de
    # l'inference, aucune source temps reel (backend/MongoDB) n'existe encore
    # pour les fournir. Le modele se base uniquement sur la meteo prevue et
    # le contexte temporel (heure/mois). A enrichir avec des lags une fois
    # le backend operationnel (S3-S4).
    feature_cols = [
        "hub_station_id", "timestamp",
        "radiation_wm2", "temperature_c",
        "heure_sin", "heure_cos", "mois_sin", "mois_cos", "est_weekend",
        "production_actuelle_kw",  # cible, en derniere colonne
    ]
    result = df[feature_cols]
    result.to_csv(path_out, index=False)
    return result
 
 
def build_features_disponibilite(path_in: str = "data/sessions_charge.csv",
                                 path_out: str = "data/features_disponibilite.csv") -> pd.DataFrame:
    sessions = pd.read_csv(path_in, parse_dates=["heure_debut", "heure_fin"])
 
    rows = []
    for hub_id, info in CAPACITE_PAR_HUB.items():
        hub_sessions = sessions[sessions["hub_station_id"] == hub_id]
        if hub_sessions.empty:
            continue
 
        start = hub_sessions["heure_debut"].min().floor("h")
        end = hub_sessions["heure_fin"].max().ceil("h")
        heures = pd.date_range(start, end, freq="h")
 
        for ts in heures:
            occupees = hub_sessions[
                (hub_sessions["heure_debut"] <= ts) & (hub_sessions["heure_fin"] > ts)
            ]["borne_id"].nunique()
 
            n_bornes = info["n_bornes"]
            disponibilite_pct = 100 * (n_bornes - occupees) / n_bornes
 
            rows.append({
                "hub_station_id": hub_id,
                "timestamp": ts,
                "n_bornes_total": n_bornes,
                "n_bornes_occupees": occupees,
                "disponibilite_bornes_pct": round(disponibilite_pct, 1),
            })
 
    df = pd.DataFrame(rows)
    df = df.sort_values(["hub_station_id", "timestamp"]).reset_index(drop=True)
    df = add_time_features(df)
 
    # NB : pas de lags ici, meme raison que pour la production (voir
    # build_features_production). A enrichir en S3-S4.
    feature_cols = [
        "hub_station_id", "timestamp",
        "heure_sin", "heure_cos", "mois_sin", "mois_cos", "est_weekend", "jour_semaine",
        "disponibilite_bornes_pct",  # cible, en derniere colonne
    ]
    result = df[feature_cols]
    result.to_csv(path_out, index=False)
    return result
 
 
if __name__ == "__main__":
    prod_df = build_features_production()
    print(f"Production : {len(prod_df)} lignes -> data/features_production.csv")
 
    dispo_df = build_features_disponibilite()
    print(f"Disponibilite : {len(dispo_df)} lignes -> data/features_disponibilite.csv")