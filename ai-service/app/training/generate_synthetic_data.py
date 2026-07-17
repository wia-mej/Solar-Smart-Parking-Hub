"""
Genere les sessions de charge simulees (occupation des bornes).
 
La production solaire n'est PLUS simulee ici : elle vient de vraies
donnees meteo Open-Meteo (voir fetch_real_weather_data.py). Ce script
gere uniquement le comportement des utilisateurs, pour lequel aucune
donnee reelle n'existe (produit pas encore deploye).
 
Parametres lus depuis parametres_simulation.xlsx (onglets Hubs et
Sessions_Charge) - modifiable sans toucher au code.
 
Sortie : data/sessions_charge.csv
"""
 
import os
import numpy as np
import pandas as pd
from datetime import timedelta
 
RANDOM_SEED = 42
rng = np.random.default_rng(RANDOM_SEED)
 
PARAMS_FILE = "parametres_simulation.xlsx"
START_DATE = pd.Timestamp("2025-01-01")
N_DAYS = 365
 
 
def load_params(path: str = PARAMS_FILE):
    hubs_df = pd.read_excel(path, sheet_name="Hubs", header=3)
    hubs_df = hubs_df.dropna(subset=["Hub_ID"])
 
    sessions_df = pd.read_excel(path, sheet_name="Sessions_Charge", header=3)
    sessions_df = sessions_df.dropna(subset=["Parametre"])
    session_params = dict(zip(sessions_df["Parametre"], sessions_df["Valeur"]))
 
    return hubs_df, session_params
 
 
def generate_sessions_charge(hubs_df, p) -> pd.DataFrame:
    rows = []
    session_id = 1
 
    heure_pointe_semaine = float(p["Heure_pointe_semaine"])
    heure_pointe_weekend = float(p["Heure_pointe_weekend"])
    sessions_semaine = float(p["Sessions_moyennes_semaine"])
    sessions_weekend = float(p["Sessions_moyennes_weekend"])
    ratio_reservee = float(p["Ratio_reservee"])
    duree_min = int(p["Duree_min_session"])
    duree_max = int(p["Duree_max_session"])
    kwh_min = float(p["Kwh_min_session"])
    kwh_max = float(p["Kwh_max_session"])
 
    for _, hub in hubs_df.iterrows():
        hub_id = hub["Hub_ID"]
        n_bornes = int(hub["Nombre_Bornes"])
 
        for day_offset in range(N_DAYS):
            date = START_DATE + timedelta(days=day_offset)
            is_weekend = date.weekday() >= 5
            mean_sessions = sessions_weekend if is_weekend else sessions_semaine
            n_sessions = rng.poisson(mean_sessions)
 
            for _ in range(n_sessions):
                mean_hour = heure_pointe_weekend if is_weekend else heure_pointe_semaine
                hour = int(np.clip(rng.normal(mean_hour, 3), 6, 22))
                start = date.replace(hour=hour, minute=int(rng.uniform(0, 59)))
                duree = int(rng.uniform(duree_min, duree_max))
                end = start + timedelta(minutes=duree)
                kwh = round(rng.uniform(kwh_min, kwh_max), 1)
                origine = rng.choice(["reservee", "walk_in"], p=[ratio_reservee, 1 - ratio_reservee])
                borne_id = f"{hub_id}_borne_{rng.integers(1, n_bornes + 1)}"
 
                rows.append({
                    "id": f"session_{session_id}",
                    "hub_station_id": hub_id,
                    "borne_id": borne_id,
                    "heure_debut": start,
                    "heure_fin": end,
                    "kwh_consommes": kwh,
                    "origine": origine,
                    "statut": "terminee",
                })
                session_id += 1
 
    return pd.DataFrame(rows)
 
 
if __name__ == "__main__":
    hubs_df, session_params = load_params()
 
    os.makedirs("data", exist_ok=True)
 
    sessions_df = generate_sessions_charge(hubs_df, session_params)
    sessions_df.to_csv("data/sessions_charge.csv", index=False)
 
    print(f"Hubs charges depuis Excel : {list(hubs_df['Hub_ID'])}")
    print(f"Sessions de charge : {len(sessions_df)} lignes -> data/sessions_charge.csv")