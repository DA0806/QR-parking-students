# CLAUDE.md — Key Alumnos: QR Parking Platform

> Place this file at the root of the repository. Claude Code will automatically load it as context for every session.

---

## 🧠 Project Overview

**Key Alumnos** is a campus QR parking management platform built with **Expo (React Native)**, **Node.js/Express**, and **Clerk** authentication. It manages real-time parking occupancy through QR code scanning across 3 user roles.

- **Frontend:** Expo SDK 54, Expo Router (file-system), NativeWind v4, TypeScript
- **Backend:** Node.js + Express + SQLite3 (`backend/keyalumnos.db`)
- **Auth:** Clerk Expo — Microsoft SSO + email, role-based via `publicMetadata.role`
- **Hardware:** `expo-camera` (QR scan), `expo-crypto` (QR signing), `react-native-qrcode-svg`
- **Styling:** NativeWind v4 (Tailwind for React Native) + `global.css`

### User Roles
| Role | Access |
|------|--------|
| `student` | Live parking dashboard, personal QR pass, vehicle management |
| `admin` | Zone selector, native QR scanner, entry/exit logic |
| `superadmin` | Zone CRUD, user panel via Clerk API, role promotion |

### Key Directories
```
app/           → Expo Router screens (file-system routing)
backend/       → Express API + SQLite DB
components/    → Shared React Native components
context/       → React context providers (auth, role, etc.)
config/api.ts  → HOST constant for backend connection
hooks/         → Custom React hooks
db/            → DB schema / seed scripts
constants/     → App-wide constants (colors, zones, etc.)
```

---

## 🔌 Active MCP Plugins

### 1. `expo` Plugin
Use the Expo MCP plugin for all Expo-specific tasks:
- Querying Expo SDK docs and changelogs
- Checking `expo-camera`, `expo-router`, `expo-secure-store`, and `expo-crypto` API references
- Validating `app.json` / `app.config.js` configuration fields
- Diagnosing Expo Go vs development build compatibility
- Checking EAS build configuration and profiles

**When to invoke:** Any task touching Expo APIs, routing, permissions (`app.json`), native modules, or SDK upgrades.

### 2. `superpowers` Plugin
Use the Superpowers MCP plugin for:
- Running shell commands to inspect, lint, or test the codebase
- Reading and writing files across the repo
- Executing the backend (`node backend/index.js`) and observing logs
- Running `npx expo lint` and fixing reported issues
- Searching across the full codebase for patterns, TODOs, and inconsistencies

**When to invoke:** Any task that requires reading multiple files, running scripts, searching the repo, or making cross-cutting changes.

---

## 🎯 Improvement Priorities

When asked to improve this project, work through these areas in order. Always use the **expo** plugin to verify API correctness and **superpowers** to read existing files before modifying them.

### 1. 🔐 Security — CRITICAL
- **`.env` is committed to the repository** — immediately add it to `.gitignore` and rotate any exposed keys.
- The `config/api.ts` HOST is hardcoded. Replace it with `process.env.EXPO_PUBLIC_API_HOST` with a fallback for the Android emulator (`10.0.2.2`).
- Backend has no input validation on API routes — add `express-validator` or `zod` to all POST/PATCH endpoints.
- SQLite queries should use parameterized statements everywhere; audit for any raw string interpolation.
- The `.env` file contains `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — verify no secret keys (sk_*) are accidentally exposed client-side.

### 2. 🗂️ TypeScript Strictness
- Enable `"strict": true` in `tsconfig.json` and fix all resulting type errors.
- The codebase is 81% TypeScript — find all remaining `.js` files in `app/` and `components/` and migrate them.
- Add explicit return types to all API route handlers in `backend/`.
- Create a shared `types/` directory with interfaces for `User`, `ParkingZone`, `Vehicle`, `ScanEvent`.

### 3. 🏗️ Architecture & Code Quality
- `config/api.ts` should export a typed `apiClient` (e.g., using `ky` or a simple `fetch` wrapper) rather than just a HOST string — centralize all API calls.
- The Context providers in `context/` likely hold server-fetched data; replace polling (if any) with proper `useEffect` + `SWR` or `React Query` for cache management.
- `firebase` is listed as a dependency but the backend uses SQLite — remove Firebase if unused, or document its purpose.
- Separate backend route handlers into `backend/routes/` and `backend/controllers/` directories.

### 4. 📱 Expo & React Native Best Practices
- Use the **expo plugin** to verify all installed packages are compatible with Expo SDK 54.
- Add `expo-updates` for OTA update support in production builds.
- The QR scanner uses `expo-camera` — ensure camera permissions are handled gracefully with a fallback UI using `Camera.requestCameraPermissionsAsync()`.
- Replace any `expo-av` usage (listed as a dep but not obviously needed) — remove if unused.
- Add `expo-dev-client` for a proper development build with all native modules.
- Configure `app.json` with proper `android.permissions` and `ios.infoPlist` entries for camera access.

### 5. 🚦 Error Handling & UX
- Wrap all `fetch()` calls in try/catch and show user-facing error toasts (use `expo-haptics` for feedback on scan errors).
- The QR scanner should show visual feedback (colored overlay) on successful vs failed scans.
- Add loading skeletons to the parking occupancy dashboard while data loads.
- Handle the offline case — the app should degrade gracefully if the backend is unreachable.

### 6. 🧪 Testing
- Add `jest` + `jest-expo` for unit tests.
- Write tests for the QR validation logic in the backend (entry/exit aforo counting).
- Add integration tests for the 3 role flows using mock Clerk sessions.

### 7. 📝 Documentation
- The README is good but the manual SQLite role-promotion step for `superadmin` is a friction point — add a `npm run seed:superadmin` script to automate it.
- Add JSDoc comments to all context providers and custom hooks.
- Document the `ScanEvent` lifecycle (QR generation → scan → backend validation → aforo update).

---

## 🛠️ Development Workflow

```bash
# Start backend
cd backend && node index.js

# Start frontend (cache cleared)
npm start -- -c

# Lint
npx expo lint

# Type check
npx tsc --noEmit
```

### Environment Variables (`.env` — NEVER COMMIT)
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_API_HOST=http://192.168.x.x:3000   # or 10.0.2.2:3000 for Android emulator
```

---

## ✅ Claude Code Behavior Rules

1. **Always read files before editing.** Use superpowers to read the current content of any file before making changes.
2. **Verify Expo APIs with the expo plugin** before writing any code using Expo SDK modules — APIs change between SDK versions.
3. **Never hardcode secrets or IPs** — use `process.env.EXPO_PUBLIC_*` variables.
4. **NativeWind classes only** — do not use `StyleSheet.create()` in new components; use Tailwind utility classes via NativeWind v4.
5. **Expo Router file conventions** — new screens go in `app/`, use `(group)` folders for role-based layouts, `_layout.tsx` for shared navigation structure.
6. **Parameterized SQL** — every DB query in the backend must use `?` placeholders, never string concatenation.
7. **Role checks server-side** — never trust `publicMetadata.role` from the client alone; validate against the backend's `Users` table on protected routes.
8. **Commit hygiene** — after any change, remind the user to run `npx expo lint` and `npx tsc --noEmit` before committing.
