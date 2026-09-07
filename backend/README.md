# Backend API

Spring Boot REST API for ParkRee: manages stations, charging points, reservations, charging sessions, users and the link with the AI prediction service. Backed by MongoDB Atlas and secured with Firebase Authentication.

## Modules

| Module | Responsibility |
|---|---|
| `station` | Stations and charging points |
| `reservation` | Charging spot reservations |
| `sessioncharge` | Charging sessions |
| `utilisateur` | Users: drivers and administrators |
| `prediction` | Energy and availability predictions, fetched from the AI service |
| `productionenergie` | Solar energy production records |
| `alerte` | Alerts and notifications |
| `acceslog` | Access logs for stations and charging points |

## Configuration

Settings live in `src/main/resources/application.properties`.

| Property | Purpose |
|---|---|
| `spring.mongodb.uri` | MongoDB Atlas connection string |
| `aiservice.url` | Base URL of the AI service |
| `server.port` | HTTP port (`8080` by default, matching the Dockerfile) |
| `allowed.origins` | CORS allowed origins for the backoffice and mobile app |
| `management.endpoints.web.exposure.include` | Spring Actuator endpoints exposed (health checks) |

Authentication is validated against the same Firebase project used by the backoffice and mobile app.

## Running locally

```bash
mvn spring-boot:run
```

The API starts on `http://localhost:8080`.

## Tests

```bash
mvn test
```

## Requirements

Java 17. Built and run with the standard Maven wrapper (`./mvnw`) or a local Maven installation.
