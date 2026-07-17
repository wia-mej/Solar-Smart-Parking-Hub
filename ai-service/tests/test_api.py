"""
Tests pytest pour l'API Solar Smart Parking Hub - AI Service.

Couvre :
  - /health : statut du service et chargement des modeles
  - /predict/production : coherence physique et cas limites
  - /predict/disponibilite : coherence des pourcentages et cas limites
  - Differenciation entre hubs (encodage one-hot correct)
  - Validation des entrees invalides (schema Pydantic -> 422)
  - Cas d'erreur metier : hub inconnu -> 400

Lancement depuis le dossier ai-service/ :
    pytest tests/ -v
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

# ---------------------------------------------------------------------------
# Constantes de test
# ---------------------------------------------------------------------------
HUBS_VALIDES = ["hub_casablanca", "hub_rabat", "hub_tanger", "hub_marrakech"]

# Timestamp diurne en ete (forte production attendue)
TS_MIDI_ETE = "2024-06-15T12:00:00"
# Timestamp nocturne (production solaire attendue = 0)
TS_NUIT = "2024-06-15T02:00:00"
# Timestamp heure de pointe (forte occupation attendue)
TS_MATIN_SEMAINE = "2024-06-10T09:00:00"


# ===========================================================================
# 1. /health
# ===========================================================================

class TestHealth:
    def test_health_retourne_200(self):
        resp = client.get("/health")
        assert resp.status_code == 200

    def test_health_structure_reponse(self):
        data = client.get("/health").json()
        assert "status" in data
        assert "model_production_charge" in data
        assert "model_disponibilite_charge" in data

    def test_health_status_ok(self):
        data = client.get("/health").json()
        assert data["status"] == "ok"

    def test_health_modeles_charges(self):
        """Verifie que les deux modeles sont bien charges depuis les fichiers .pkl."""
        data = client.get("/health").json()
        assert data["model_production_charge"] is True, (
            "Le modele de production n'est pas charge. "
            "Verifiez que app/model/model_production.pkl existe."
        )
        assert data["model_disponibilite_charge"] is True, (
            "Le modele de disponibilite n'est pas charge. "
            "Verifiez que app/model/model_disponibilite.pkl existe."
        )


# ===========================================================================
# 2. /predict/production
# ===========================================================================

class TestPredictProduction:

    def _post(self, hub_id, timestamp, radiation_wm2, temperature_c):
        return client.post("/predict/production", json={
            "hub_id": hub_id,
            "timestamp": timestamp,
            "radiation_wm2": radiation_wm2,
            "temperature_c": temperature_c,
        })

    # --- Cas nominaux ---

    @pytest.mark.parametrize("hub_id", HUBS_VALIDES)
    def test_tous_les_hubs_valides(self, hub_id):
        resp = self._post(hub_id, TS_MIDI_ETE, 800.0, 30.0)
        assert resp.status_code == 200, f"Hub {hub_id} a echoue : {resp.json()}"

    def test_structure_reponse(self):
        resp = self._post("hub_casablanca", TS_MIDI_ETE, 800.0, 30.0)
        data = resp.json()
        assert "hub_id" in data
        assert "timestamp" in data
        assert "production_solaire_predite_kw" in data

    def test_hub_id_repercute_dans_reponse(self):
        resp = self._post("hub_rabat", TS_MIDI_ETE, 500.0, 25.0)
        assert resp.json()["hub_id"] == "hub_rabat"

    # --- Coherence physique ---

    def test_production_non_negative(self):
        """La production solaire ne peut jamais etre negative."""
        resp = self._post("hub_casablanca", TS_MIDI_ETE, 800.0, 32.0)
        assert resp.json()["production_solaire_predite_kw"] >= 0.0

    def test_production_nulle_la_nuit(self):
        """
        La nuit (radiation = 0), la production doit etre proche de 0.
        On tolere jusqu'a 1 kW (bruit du modele).
        """
        resp = self._post("hub_casablanca", TS_NUIT, 0.0, 18.0)
        pred = resp.json()["production_solaire_predite_kw"]
        assert pred <= 1.0, f"Production nocturne anormalement elevee : {pred} kW"

    def test_forte_radiation_donne_forte_production(self):
        """800 W/m² doit produire plus que 100 W/m² (toutes choses egales)."""
        pred_haute = self._post("hub_marrakech", TS_MIDI_ETE, 800.0, 30.0).json()[
            "production_solaire_predite_kw"
        ]
        pred_basse = self._post("hub_marrakech", TS_MIDI_ETE, 100.0, 30.0).json()[
            "production_solaire_predite_kw"
        ]
        assert pred_haute > pred_basse, (
            f"La production avec 800 W/m² ({pred_haute}) devrait depasser "
            f"celle avec 100 W/m² ({pred_basse})"
        )

    def test_production_dans_plage_realiste(self):
        """
        Les panneaux du hub font 29.76 kWc. La production predite doit rester
        dans une plage raisonnable (0 - 40 kW avec marge).
        """
        resp = self._post("hub_casablanca", TS_MIDI_ETE, 1000.0, 35.0)
        pred = resp.json()["production_solaire_predite_kw"]
        assert 0.0 <= pred <= 40.0, f"Production hors plage realiste : {pred} kW"

    # --- Coherence entre hubs ---

    def test_meme_hub_meme_meteo_donne_predictions_proches(self):
        """
        Test de coherence physique : les 4 hubs ont une capacite installee
        proche de 29.76 kWc, mais pas rigoureusement identique -- une
        variation aleatoire de +/-10% est appliquee par hub lors de la
        generation des donnees (voir rng.uniform(0.9, 1.1) dans
        fetch_real_weather_data.py), pour simuler des installations reelles
        legerement differentes. A meteo identique, les predictions doivent
        donc rester proches entre hubs, sans etre necessairement identiques
        au chiffre pres.
        """
        predictions = []
        for hub_id in HUBS_VALIDES:
            resp = self._post(hub_id, TS_MIDI_ETE, 700.0, 28.0)
            predictions.append(resp.json()["production_solaire_predite_kw"])

        ecart = max(predictions) - min(predictions)
        assert ecart < 3.0, (
            f"Ecart de production trop important entre hubs a meteo identique : "
            f"{predictions} (ecart = {ecart:.3f} kW)"
        )

    # --- Validation des entrees invalides (schema Pydantic) ---

    def test_champ_manquant_retourne_422(self):
        """Une requete sans radiation_wm2 doit etre rejetee par la validation
        Pydantic, avant meme d'atteindre la logique metier."""
        resp = client.post("/predict/production", json={
            "hub_id": "hub_casablanca",
            "timestamp": TS_MIDI_ETE,
            "temperature_c": 30.0,
            # radiation_wm2 manquant
        })
        assert resp.status_code == 422

    def test_timestamp_mal_forme_retourne_422(self):
        resp = self._post("hub_casablanca", "pas-une-date-valide", 800.0, 30.0)
        assert resp.status_code == 422

    def test_radiation_mauvais_type_retourne_422(self):
        """radiation_wm2 doit etre un nombre, pas une chaine de caracteres."""
        resp = client.post("/predict/production", json={
            "hub_id": "hub_casablanca",
            "timestamp": TS_MIDI_ETE,
            "radiation_wm2": "beaucoup",
            "temperature_c": 30.0,
        })
        assert resp.status_code == 422

    # --- Cas d'erreur metier ---

    def test_hub_inconnu_retourne_400(self):
        resp = self._post("hub_inconnu", TS_MIDI_ETE, 800.0, 30.0)
        assert resp.status_code == 400

    def test_hub_inconnu_message_erreur(self):
        resp = self._post("hub_inconnu", TS_MIDI_ETE, 800.0, 30.0)
        assert "hub_id inconnu" in resp.json()["detail"]

    def test_radiation_zero_acceptee(self):
        """radiation_wm2 = 0 est une valeur valide (nuit / nuages epais)."""
        resp = self._post("hub_tanger", TS_NUIT, 0.0, 15.0)
        assert resp.status_code == 200


# ===========================================================================
# 3. /predict/disponibilite
# ===========================================================================

class TestPredictDisponibilite:

    def _post(self, hub_id, timestamp):
        return client.post("/predict/disponibilite", json={
            "hub_id": hub_id,
            "timestamp": timestamp,
        })

    # --- Cas nominaux ---

    @pytest.mark.parametrize("hub_id", HUBS_VALIDES)
    def test_tous_les_hubs_valides(self, hub_id):
        resp = self._post(hub_id, TS_MATIN_SEMAINE)
        assert resp.status_code == 200, f"Hub {hub_id} a echoue : {resp.json()}"

    def test_structure_reponse(self):
        resp = self._post("hub_casablanca", TS_MATIN_SEMAINE)
        data = resp.json()
        assert "hub_id" in data
        assert "timestamp" in data
        assert "disponibilite_bornes_predite_pct" in data

    def test_hub_id_repercute_dans_reponse(self):
        resp = self._post("hub_tanger", TS_MATIN_SEMAINE)
        assert resp.json()["hub_id"] == "hub_tanger"

    # --- Coherence physique ---

    def test_disponibilite_entre_0_et_100(self):
        """La disponibilite est un pourcentage : toujours entre 0 et 100."""
        resp = self._post("hub_casablanca", TS_MATIN_SEMAINE)
        pct = resp.json()["disponibilite_bornes_predite_pct"]
        assert 0.0 <= pct <= 100.0, f"Disponibilite hors plage [0, 100] : {pct}%"

    @pytest.mark.parametrize("hub_id", HUBS_VALIDES)
    def test_disponibilite_toujours_bornee(self, hub_id):
        """Pour tous les hubs et plusieurs moments, la borne [0,100] tient."""
        timestamps = [TS_MIDI_ETE, TS_NUIT, TS_MATIN_SEMAINE, "2024-12-25T18:00:00"]
        for ts in timestamps:
            pct = self._post(hub_id, ts).json()["disponibilite_bornes_predite_pct"]
            assert 0.0 <= pct <= 100.0, (
                f"Hub={hub_id}, ts={ts} -> disponibilite={pct}% hors [0,100]"
            )

    # --- Differenciation entre hubs ---

    def test_hubs_differents_donnent_predictions_differentes(self):
        """Meme logique que pour la production : le hub_id doit influencer
        la prediction de disponibilite."""
        predictions = {}
        for hub_id in HUBS_VALIDES:
            resp = self._post(hub_id, TS_MATIN_SEMAINE)
            predictions[hub_id] = resp.json()["disponibilite_bornes_predite_pct"]

        valeurs_uniques = set(predictions.values())
        assert len(valeurs_uniques) > 1, (
            f"Tous les hubs donnent la meme prediction ({predictions}) : "
            "l'encodage du hub_id ne semble pas pris en compte par le modele."
        )

    # --- Validation des entrees invalides (schema Pydantic) ---

    def test_champ_manquant_retourne_422(self):
        resp = client.post("/predict/disponibilite", json={
            "hub_id": "hub_casablanca",
            # timestamp manquant
        })
        assert resp.status_code == 422

    def test_timestamp_mal_forme_retourne_422(self):
        resp = self._post("hub_casablanca", "le-15-juin-a-midi")
        assert resp.status_code == 422

    def test_hub_id_mauvais_type_retourne_422(self):
        """hub_id doit etre une chaine, pas un nombre."""
        resp = client.post("/predict/disponibilite", json={
            "hub_id": 12345,
            "timestamp": TS_MATIN_SEMAINE,
        })
        assert resp.status_code == 422

    # --- Cas d'erreur metier ---

    def test_hub_inconnu_retourne_400(self):
        resp = self._post("hub_inconnu", TS_MATIN_SEMAINE)
        assert resp.status_code == 400

    def test_hub_inconnu_message_erreur(self):
        resp = self._post("hub_inconnu", TS_MATIN_SEMAINE)
        assert "hub_id inconnu" in resp.json()["detail"]

    def test_weekend_accepte(self):
        """Un timestamp week-end est une entree valide."""
        resp = self._post("hub_rabat", "2024-06-15T10:00:00")  # samedi
        assert resp.status_code == 200