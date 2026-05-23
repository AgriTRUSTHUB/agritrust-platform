# AgriTRUST — Mobile Application

React Native mobile app for the AgriTRUST agricultural technology platform.
Built with Expo for iOS and Android.

---

## Status: In Development

The mobile app scaffold is fully structured and ready for development.
Full feature parity with the web platform is planned for Phase 2.

The API server in `artifacts/api-server/` serves both the web platform
and this mobile app.

---

## Tech Stack

- React Native (Expo)
- Expo Router (file-based navigation)
- React Navigation v6
- Axios (API calls)
- AsyncStorage (local storage)
- Expo Camera (QualityScan)
- Expo Location (geolocation)
- Expo Notifications (push alerts)

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- Expo Go app on your phone, or iOS Simulator / Android Emulator

### Run the app

```bash
# From the repo root
pnpm install

# Start the mobile app
pnpm --filter @workspace/agritrust-mobile run dev

# Scan the QR code with Expo Go, or press:
# i → iOS simulator
# a → Android emulator
```

---

## Screen Structure

```
src/app/
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/
│   ├── index.tsx          Dashboard
│   ├── marketplace.tsx    Browse listings
│   ├── landshare.tsx      Land opportunities
│   ├── finance.tsx        Harvest Finance
│   ├── community.tsx      Community posts
│   └── profile.tsx        User profile
└── _layout.tsx
```

---

## API Connection

Update the base URL in your environment config:

```bash
# .env
EXPO_PUBLIC_API_URL=https://api.agritrust.com
# Local development:
# EXPO_PUBLIC_API_URL=http://localhost:3001
```

---

## Planned Mobile Features

- AgriVoice: voice commands in local languages
- QualityScan: camera-based crop quality scan
- AgriWatch: push alerts for nearby theft
- Offline mode: browse cached listings
- USSD bridge: feature phone access to platform

---

## License

AGPLv3 — see [LICENSE](../../LICENSE) for details.
