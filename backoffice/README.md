# Backoffice

Angular administration dashboard for ParkRee. Station operators use it to monitor the network, manage stations and charging points, review reservations, handle user accounts and alerts, and export data. Authenticated against the same Firebase project as the mobile app.

## Features

| Section | Purpose |
|---|---|
| `dashboard` | Production, occupancy and revenue overview, with live charts |
| `stations` | Station and charging point management, including a map view |
| `reservations` | Reservation monitoring |
| `utilisateurs` | User account management |
| `alertes` | Alerts and notifications |
| `export` | Data export |
| `login` | Firebase authenticated sign in |

## Running locally

```bash
npm install
npm start
```

Once the dev server is running, open `http://localhost:4200`. The application reloads automatically when source files change.

## Building

```bash
ng build
```

The production build is written to `dist/backoffice/browser`. The Docker image builds this output and serves it with nginx on port 80.

## Tests

```bash
ng test
```

Runs the unit tests with Vitest.
