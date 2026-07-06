\# Solar Smart Parking Hub



A connected platform for managing solar-powered EV charging hubs (ParkRee), built during a PFA internship at Nalida Power. It covers a mobile app for drivers, a backoffice for admins, an AI service for energy predictions, and the cloud infrastructure to run it all.



\## Tech stack



\- \*\*Backend\*\* — Spring Boot (Java)

\- \*\*AI service\*\* — FastAPI (Python) + XGBoost

\- \*\*Mobile app\*\* — React Native

\- \*\*Backoffice\*\* — Angular

\- \*\*Database\*\* — MongoDB Atlas

\- \*\*Infrastructure\*\* — k3s on Oracle Cloud Infrastructure (Free Tier)

\- \*\*CI/CD\*\* — GitHub Actions

\- \*\*Monitoring\*\* — Prometheus / Grafana



\## Project structure



This is a monorepo — one repo, one folder per service. Each service has its own CI pipeline that only runs when its folder changes.



```

backend/         Spring Boot API (users, stations, chargers, reservations, sessions)

ai-service/       FastAPI microservice serving the energy prediction model

mobile/           React Native app for drivers

backoffice/       Angular dashboard for admins

deployment/       Kubernetes manifests + Terraform scripts

docs/             Specs, diagrams, planning

```



\## Branching



\- `main` — always deployable, protected, triggers CD

\- `dev` — day-to-day integration branch

\- `feature/\*` — one branch per task, merged into `dev` via PR



\## Getting started



Clone the repo:

```bash

git clone https://github.com/<your-username>/solar-smart-parking-hub.git

cd solar-smart-parking-hub

```



\### AI service

```bash

cd ai-service

pip install -r requirements.txt

uvicorn app.main:app --reload

```

Runs on `http://localhost:8000`. Check `http://localhost:8000/health` to confirm it's up.



\### Backend

```bash

cd backend

mvn spring-boot:run

```



\### Backoffice

```bash

cd backoffice

npm install

npm start

```



\### Mobile

```bash

cd mobile

npm install

npx react-native start

```



\## Status



Work in progress — see `docs/` for the current planning and specs.

