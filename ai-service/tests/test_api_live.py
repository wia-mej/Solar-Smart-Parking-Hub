"""
Tests d'integration LIVE - Solar Smart Parking Hub - AI Service.

Ces tests appellent le VRAI serveur uvicorn en cours d'execution.
=> Lancer le serveur d'abord : uvicorn app.main:app --reload
=> Puis lancer : pytest tests/test_api_live.py -v

URL cible configurable via la variable BASE_URL (defaut : http://127.0.0.1:8000)
"""

import pytest
import requests

BASE_URL = "http://127.0.0.1:8000"

HUBS_VALIDES = ["hub_casablanca", "hub_rabat", "hub_tanger", "hub_marrakech"]

TS_MIDI_ETE      = "2024-06-15T12:00:00"
TS_NUIT          = "2024-06-15T02:00:00"
TS_MATIN_SEMAINE = "2024-06-10T09:00:00"


def serveur_disponible():
    """Verifie que le serveur est bien lance avant d'executer les tests."""
    try:
        requests.get(f"{BASE_URL}/health", timeout=3)
        return True
    except requests.ConnectionError:
        return False


# Si le serveur n'est pas lance, on saute tous les tests avec un message clair
pytestmark = pytest.mark.skipif(
    not serveur_disponible(),
    reason=f"Serveur non accessible sur {BASE_URL}. Lancez d'abord : uvicorn app.main:app --reload",
)


# ===========================================================================
# 1. /health
# ===========================================================================

class TestHealthLive:

    def test_health_retourne_200(self):
        resp = requests.get(f"{BASE_URL}/health")
        assert resp.status_code == 200

    def test_health_structure_reponse(self):
        data = requests.get(f"{BASE_URL}/health").json()
        assert "status" in data
        assert "model_production_charge" in data
        assert "model_disponibilite_charge" in data

    def test_health_status_ok(self):
        data = requests.get(f"{BASE_URL}/health").json()
        assert data["status"] == "ok"

    def test_health_modeles_charges(self):
        data = requests.get(f"{BASE_URL}/health").json()
        assert data["model_production_charge"] is True, (
            "Modele de production non charge sur le serveur live."
        )
        assert data["model_disponibilite_charge"] is True, (
            "Modele de disponibilite non charge sur le serveur live."
        )

    def test_temps_reponse_acceptable(self):
        """Le endpoint /health doit repondre en moins de 1 seconde."""
        resp = requests.get(f"{BASE_URL}/health", timeout=5)
        assert resp.elapsed.total_seconds() < 1.0, (
            f"Temps de reponse trop lent : {resp.elapsed.total_seconds():.2f}s"
        )


# ===========================================================================
# 2. /predict/production (live)
# ===========================================================================

class TestPredictProductionLive:

    def _post(self, hub_id, timestamp, radiation_wm2, temperature_c):
        return requests.post(
            f"{BASE_URL}/predict/production",
            json={
                "hub_id": hub_id,
                "timestamp": timestamp,
                "radiation_wm2": radiation_wm2,
                "temperature_c": temperature_c,
            },
            timeout=10,
        )

    @pytest.mark.parametrize("hub_id", HUBS_VALIDES)
    def test_tous_les_hubs_valides(self, hub_id):
        resp = self._post(hub_id, TS_MIDI_ETE, 800.0, 30.0)
        assert resp.status_code == 200, f"Hub {hub_id} -> {resp.json()}"

    def test_structure_reponse(self):
        data = self._post("hub_casablanca", TS_MIDI_ETE, 800.0, 30.0).json()
        assert "hub_id" in data
        assert "timestamp" in data
        assert "production_solaire_predite_kw" in data

    def test_production_non_negative(self):
        data = self._post("hub_casablanca", TS_MIDI_ETE, 800.0, 32.0).json()
        assert data["production_solaire_predite_kw"] >= 0.0

    def test_production_nulle_la_nuit(self):
        data = self._post("hub_casablanca", TS_NUIT, 0.0, 18.0).json()
        pred = data["production_solaire_predite_kw"]
        assert pred <= 1.0, f"Production nocturne anormalement elevee : {pred} kW"

    def test_forte_radiation_donne_forte_production(self):
        pred_haute = self._post("hub_marrakech", TS_MIDI_ETE, 800.0, 30.0).json()[
            "production_solaire_predite_kw"
        ]
        pred_basse = self._post("hub_marrakech", TS_MIDI_ETE, 100.0, 30.0).json()[
            "production_solaire_predite_kw"
        ]
        assert pred_haute > pred_basse, (
            f"800 W/m² ({pred_haute} kW) devrait > 100 W/m² ({pred_basse} kW)"
        )

    def test_production_dans_plage_realiste(self):
        data = self._post("hub_casablanca", TS_MIDI_ETE, 1000.0, 35.0).json()
        pred = data["production_solaire_predite_kw"]
        assert 0.0 <= pred <= 40.0, f"Production hors plage : {pred} kW"

    def test_hub_inconnu_retourne_400(self):
        resp = self._post("hub_inconnu", TS_MIDI_ETE, 800.0, 30.0)
        assert resp.status_code == 400

    def test_hub_inconnu_message_erreur(self):
        resp = self._post("hub_inconnu", TS_MIDI_ETE, 800.0, 30.0)
        assert "hub_id inconnu" in resp.json()["detail"]

    def test_temps_reponse_acceptable(self):
        """La prediction doit repondre en moins de 2 secondes."""
        resp = self._post("hub_rabat", TS_MIDI_ETE, 600.0, 28.0)
        assert resp.elapsed.total_seconds() < 2.0, (
            f"Prediction trop lente : {resp.elapsed.total_seconds():.2f}s"
        )

    def test_content_type_json(self):
        resp = self._post("hub_casablanca", TS_MIDI_ETE, 500.0, 25.0)
        assert "application/json" in resp.headers["content-type"]


# ===========================================================================
# 3. /predict/disponibilite (live)
# ===========================================================================

class TestPredictDisponibiliteLive:

    def _post(self, hub_id, timestamp):
        return requests.post(
            f"{BASE_URL}/predict/disponibilite",
            json={"hub_id": hub_id, "timestamp": timestamp},
            timeout=10,
        )

    @pytest.mark.parametrize("hub_id", HUBS_VALIDES)
    def test_tous_les_hubs_valides(self, hub_id):
        resp = self._post(hub_id, TS_MATIN_SEMAINE)
        assert resp.status_code == 200, f"Hub {hub_id} -> {resp.json()}"

    def test_structure_reponse(self):
        data = self._post("hub_casablanca", TS_MATIN_SEMAINE).json()
        assert "hub_id" in data
        assert "timestamp" in data
        assert "disponibilite_bornes_predite_pct" in data

    def test_disponibilite_entre_0_et_100(self):
        data = self._post("hub_casablanca", TS_MATIN_SEMAINE).json()
        pct = data["disponibilite_bornes_predite_pct"]
        assert 0.0 <= pct <= 100.0, f"Disponibilite hors plage : {pct}%"

    @pytest.mark.parametrize("hub_id", HUBS_VALIDES)
    def test_disponibilite_toujours_bornee(self, hub_id):
        timestamps = [TS_MIDI_ETE, TS_NUIT, TS_MATIN_SEMAINE, "2024-12-25T18:00:00"]
        for ts in timestamps:
            pct = self._post(hub_id, ts).json()["disponibilite_bornes_predite_pct"]
            assert 0.0 <= pct <= 100.0, f"Hub={hub_id}, ts={ts} -> {pct}% hors [0,100]"

    def test_hub_inconnu_retourne_400(self):
        resp = self._post("hub_inconnu", TS_MATIN_SEMAINE)
        assert resp.status_code == 400

    def test_hub_inconnu_message_erreur(self):
        resp = self._post("hub_inconnu", TS_MATIN_SEMAINE)
        assert "hub_id inconnu" in resp.json()["detail"]

    def test_weekend_accepte(self):
        resp = self._post("hub_rabat", "2024-06-15T10:00:00")
        assert resp.status_code == 200

    def test_temps_reponse_acceptable(self):
        """La prediction doit repondre en moins de 2 secondes."""
        resp = self._post("hub_tanger", TS_MATIN_SEMAINE)
        assert resp.elapsed.total_seconds() < 2.0, (
            f"Prediction trop lente : {resp.elapsed.total_seconds():.2f}s"
        )

    def test_content_type_json(self):
        resp = self._post("hub_casablanca", TS_MATIN_SEMAINE)
        assert "application/json" in resp.headers["content-type"]
