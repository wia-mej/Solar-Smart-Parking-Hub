"""
Recupere des donnees meteo REELLES (rayonnement solaire + temperature)
via l'API historique d'Open-Meteo (reanalyse ERA5), pour les 4 villes
retenues, sur plusieurs annees.
 
Aucune cle API requise. Gratuit jusqu'a 10 000 appels/jour (usage non
commercial). Donnees sourcees : Open-Meteo.com, CC BY 4.0.
 
Sortie : data/production_energie_reelle.csv
(remplace la partie "production solaire" du generateur simule precedent ;
les sessions de charge restent simulees separement via
generate_synthetic_data.py)
"""
 
import os
import time
import requests
import pandas as pd
 
# ---- Villes retenues (coordonnees approximatives centre-ville) ----
HUBS = {
    "hub_casablanca": {"lat": 33.5731, "lon": -7.5898, "capacite_kwc": 29.76},
    "hub_rabat": {"lat": 34.0209, "lon": -6.8416, "capacite_kwc": 29.76},
    "hub_tanger": {"lat": 35.7595, "lon": -5.8340, "capacite_kwc": 29.76},
    "hub_marrakech": {"lat": 31.6295, "lon": -7.9811, "capacite_kwc": 29.76},
}
 
START_YEAR = 2015
END_YEAR = 2024  # 10 ans d'historique
 
PERFORMANCE_RATIO = 0.8375        # rapport PVsyst interne
TEMP_COEFF = -0.0029              # -0.29 %/degC, datasheet JINKO (rapport Nouhaila)
STC_TEMP = 25.0                   # temperature de reference des panneaux (25 degC)
 
BASE_URL = "https://archive-api.open-meteo.com/v1/archive"
 
 
def fetch_year(lat: float, lon: float, year: int) -> pd.DataFrame:
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": f"{year}-01-01",
        "end_date": f"{year}-12-31",
        "hourly": "shortwave_radiation,temperature_2m",
        "timezone": "Africa/Casablanca",
    }
    response = requests.get(BASE_URL, params=params, timeout=60)
    response.raise_for_status()
    data = response.json()["hourly"]
    return pd.DataFrame({
        "timestamp": pd.to_datetime(data["time"]),
        "radiation_wm2": data["shortwave_radiation"],
        "temperature_c": data["temperature_2m"],
    })
 
 
def radiation_to_production(radiation_wm2: float, temperature_c: float, capacite_kwc: float) -> float:
    """Convertit un rayonnement (W/m2) + temperature en production estimee (kW)."""
    if radiation_wm2 is None or radiation_wm2 <= 0:
        return 0.0
    derating = 1 + TEMP_COEFF * (temperature_c - STC_TEMP)
    derating = max(0.7, derating)  # on evite les derating irrealistes
    kw = capacite_kwc * (radiation_wm2 / 1000) * PERFORMANCE_RATIO * derating
    return max(0.0, round(kw, 3))
 
 
def main():
    os.makedirs("data", exist_ok=True)
    all_rows = []
 
    for hub_id, hub in HUBS.items():
        print(f"Recuperation des donnees pour {hub_id}...")
        yearly_frames = []
        for year in range(START_YEAR, END_YEAR + 1):
            try:
                df_year = fetch_year(hub["lat"], hub["lon"], year)
                yearly_frames.append(df_year)
                print(f"  {year} : {len(df_year)} lignes OK")
            except Exception as e:
                print(f"  {year} : ECHEC ({e})")
            time.sleep(1)  # on reste sympa avec l'API gratuite
 
        hub_df = pd.concat(yearly_frames, ignore_index=True)
        hub_df["hub_station_id"] = hub_id
        hub_df["production_actuelle_kw"] = hub_df.apply(
            lambda row: radiation_to_production(row["radiation_wm2"], row["temperature_c"], hub["capacite_kwc"]),
            axis=1,
        )
        # proxy simple pour l'etat de charge locale (pas de vraie donnee batterie disponible)
        hub_df["charge_batterie_local_pct"] = (
            50 + hub_df["production_actuelle_kw"] * 2
        ).clip(10, 100).round(1)
 
        all_rows.append(hub_df[[
            "hub_station_id", "timestamp", "radiation_wm2", "temperature_c",
            "production_actuelle_kw", "charge_batterie_local_pct"
        ]])
 
    production_df = pd.concat(all_rows, ignore_index=True)
    production_df.to_csv("data/production_energie_reelle.csv", index=False)
    print(f"\nTermine : {len(production_df)} lignes -> data/production_energie_reelle.csv")
 
 
if __name__ == "__main__":
    main()