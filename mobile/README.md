# ParkRee — Driver Mobile App

React Native (Expo) application for electric vehicle drivers: station search,
charging point reservation, live charging session tracking, and subscription.

## Stack

- **Expo** (SDK 57) + React Native, TypeScript
- **Firebase Authentication** (same Firebase project as the backoffice)
- REST API from the Spring Boot backend

## Running in development

```bash
npm install
npx expo start
```

Then scan the QR code with the **Expo Go** app on a phone connected to the
**same Wi-Fi network** as the computer. If the phone cannot reach the computer,
the network most likely isolates its clients — use the phone's mobile hotspot
instead.

## Structure
core/ shared configuration and services (Firebase, API calls)
features/ one folder per screen
types/ additional TypeScript declarations


## Technical note

`metro.config.js` disables `unstable_enablePackageExports` and adds the `.cjs`
extension. Without these two settings, Metro resolves the web build of Firebase
Auth instead of the React Native one, which causes the
"Component auth has not been registered yet" error.