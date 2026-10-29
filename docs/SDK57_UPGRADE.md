# Edgeline — Expo SDK 57

This project has been upgraded from Expo SDK 52 to Expo SDK 57 while retaining the Edgeline redesign and existing app features.

## Requirements

- Node.js 22.13 or newer
- npm 10+ recommended
- Expo Go that supports SDK 57

## Clean install

From the `edgeline` folder:

```bash
rm -rf node_modules package-lock.json
npm install
npx expo install --fix
npx expo-doctor
npx expo start -c
```

On Windows PowerShell, you can simply delete `node_modules` and `package-lock.json` manually if they exist, then run:

```powershell
npm install
npx expo install --fix
npx expo-doctor
npx expo start -c
```

## SDK 57 baseline

- Expo: 57
- React Native: 0.86.3
- React: 19.2.3
- React Native Web: 0.21.x
- `react-native-safe-area-context`: 5.7.x
- `react-native-screens`: 4.26.x

The source still uses React Navigation rather than Expo Router, so no routing migration was required.
