# AI Service

FastAPI microservice serving the ParkRee energy prediction models. Two XGBoost models, trained offline, predict station energy production and charging point availability; the backend calls this service to feed those predictions to the mobile app and backoffice.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Service health check |
| POST | `/predict/production` | Predicts solar energy production for a station |
| POST | `/predict/disponibilite` | Predicts charging point availability |

## Models

Trained model artifacts and their expected input columns live in `app/model`:

```
model_production.pkl                Solar energy production model
model_production_columns.json       Expected feature columns for that model
model_disponibilite.pkl             Charging point availability model
model_disponibilite_columns.json    Expected feature columns for that model
```

## Training pipeline

Scripts under `app/training` regenerate the models from data.

| Script | Role |
|---|---|
| `generate_synthetic_data.py` | Generates synthetic training data |
| `fetch_real_weather_data.py` | Fetches real weather data used as a feature source |
| `build_features.py` | Builds the feature sets consumed by training |
| `train_model.py` | Trains and serializes the XGBoost models |

## Running locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The service starts on `http://localhost:8000`. Check `http://localhost:8000/health` to confirm it is up.

## Tests

```bash
pytest
```

`tests/test_api.py` covers the API against the local models; `tests/test_api_live.py` exercises a running instance.
