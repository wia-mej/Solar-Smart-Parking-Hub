# ParkRee: Driver Mobile App

React Native (Expo) application for electric vehicle drivers: station search, charging point reservation, live charging session tracking, and subscription management.

## Stack

| Component | Detail |
|---|---|
| Framework | Expo (SDK 57), React Native, TypeScript |
| Authentication | Firebase Authentication (same Firebase project as the backoffice) |
| Backend | REST API served by the Spring Boot backend |

## Running in development

```bash
npm install
cp .env.example .env    # then set EXPO_PUBLIC_API_URL to this machine's IPv4
npx expo start
```

Then scan the QR code with the Expo Go app on a phone connected to the same Wi-Fi network as the computer. If the phone cannot reach the computer, the network most likely isolates its clients; use the phone's mobile hotspot instead.

The backend must be reachable at the address set in `.env`. `localhost` will not work from a phone, since it would resolve to the phone itself.

## Structure

```
core/       Shared configuration and services (Firebase, API calls)
features/   One folder per screen
types/      Additional TypeScript declarations
```

## Technical note

`metro.config.js` disables `unstable_enablePackageExports` and adds the `.cjs` extension. Without these two settings, Metro resolves the web build of Firebase Auth instead of the React Native one, which causes the "Component auth has not been registered yet" error.
