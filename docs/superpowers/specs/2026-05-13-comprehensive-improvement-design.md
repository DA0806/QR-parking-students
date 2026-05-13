# Comprehensive Improvement Plan Design

**Date:** 2026-05-13
**Project:** Key Alumnos - QR Parking Platform
**Scope:** All 7 improvement areas with comprehensive overhaul

---

## Executive Summary

This design outlines a sequential approach to improve the Key Alumnos QR parking platform across 7 priority areas: Security, TypeScript, Architecture, Expo/React Native, Error Handling & UX, Testing, and Documentation. The approach prioritizes non-breaking changes while delivering comprehensive improvements.

---

## Overall Approach

We'll work through 7 areas sequentially, each building on the previous one:

1. **Security** (Foundation) - Fix vulnerabilities, add validation
2. **TypeScript** (Type Safety) - Enable strict mode, migrate backend, add types
3. **Architecture** (Code Quality) - apiClient, backend structure, remove unused deps
4. **Expo/React Native** (Platform) - Verify packages, add dev-client, improve permissions
5. **Error Handling & UX** (User Experience) - Try/catch, toasts, loading states
6. **Testing** (Quality Assurance) - Jest setup, unit tests, integration tests
7. **Documentation** (Knowledge) - Seed scripts, JSDoc, lifecycle docs

Each area will be implemented as a self-contained unit with clear boundaries, making it easy to test and rollback if needed.

---

## Area 1: Security (Foundation)

### Changes

- Remove `.env` from git, add to `.gitignore`
- Replace hardcoded `API_URL` with `process.env.EXPO_PUBLIC_API_HOST`
- Add fallback for Android emulator (`10.0.2.2`)
- Add `express-validator` to all POST/PATCH endpoints
- Audit SQL queries for parameterized statements
- Verify no secret keys (sk_*) exposed client-side

### Implementation Details

**Environment Variables:**
```typescript
// config/api.ts
export const API_URL = process.env.EXPO_PUBLIC_API_HOST || 'http://10.0.2.2:3000/api';
```

**Input Validation:**
```typescript
// backend/middleware/validation.js
const { body, validationResult } = require('express-validator');

const validateVehicle = [
  body('plate').isLength({ min: 3, max: 10 }).withMessage('Invalid plate format'),
  body('make').notEmpty().withMessage('Make is required'),
  body('owner_clerk_id').notEmpty().withMessage('Owner ID is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

**Non-breaking:** All changes are additive or configuration-based. Existing API contracts remain unchanged.

---

## Area 2: TypeScript (Type Safety)

### Changes

- Enable `"strict": true` in `tsconfig.json`
- Migrate `backend/index.js` and `backend/database.js` to TypeScript
- Create `types/` directory with shared interfaces
- Add explicit return types to all API route handlers
- Fix resulting type errors

### Type Definitions

```typescript
// types/index.ts
export interface User {
  clerk_id: string;
  email: string;
  name: string;
  role: 'student' | 'admin' | 'superadmin';
  qr_secret?: string;
}

export interface Vehicle {
  id: number;
  plate: string;
  owner_clerk_id: string;
  make?: string;
  model?: string;
}

export interface ParkingZone {
  id: number;
  name: string;
  total_capacity: number;
  current_occupancy: number;
}

export interface ScanEvent {
  id: number;
  vehicle_plate: string;
  zone_id: number;
  event_type: 'ENTRY' | 'EXIT';
  timestamp: string;
}

export interface QRPayload {
  userId: string;
  plate?: string;
  type?: 'pedestrian';
  timestamp: number;
}

export interface QRToken {
  payload: QRPayload;
  signature: string;
}
```

**Non-breaking:** TypeScript is a superset of JavaScript. Migration preserves existing behavior.

---

## Area 3: Architecture (Code Quality)

### Changes

- Create `config/apiClient.ts` with typed fetch wrapper
- Centralize all API calls through apiClient
- Separate backend into `backend/routes/` and `backend/controllers/`
- Remove unused `firebase` dependency
- Document Context providers' data sources
- Add proper cache management (SWR or React Query)

### Backend Structure

```
backend/
├── index.ts              # Main entry point
├── database.ts           # Database connection
├── routes/
│   ├── users.ts
│   ├── vehicles.ts
│   ├── zones.ts
│   └── events.ts
├── controllers/
│   ├── users.ts
│   ├── vehicles.ts
│   ├── zones.ts
│   └── events.ts
└── middleware/
    ├── auth.ts
    └── validation.ts
```

### API Client

```typescript
// config/apiClient.ts
import { API_URL } from './api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }
}

export const apiClient = new ApiClient();
```

**Non-breaking:** New abstractions wrap existing functionality. Old code paths remain.

---

## Area 4: Expo/React Native (Platform)

### Changes

- Verify all packages compatible with Expo SDK 54
- Add `expo-updates` for OTA support
- Add `expo-dev-client` configuration
- Improve camera permissions with fallback UI
- Remove unused `expo-av` if confirmed unused
- Configure `app.json` with proper permissions

### app.json Updates

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "expo-updates",
      "expo-dev-client",
      ["expo-camera", {
        "cameraPermission": "Permitir a Key Alumnos usar la cámara para escanear accesos QR."
      }],
      "expo-secure-store"
    ],
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Permitir a Key Alumnos usar la cámara para escanear accesos QR."
      }
    },
    "android": {
      "permissions": [
        "CAMERA"
      ]
    }
  }
}
```

**Non-breaking:** Package additions and configuration updates don't break existing code.

---

## Area 5: Error Handling & UX (User Experience)

### Changes

- Wrap all `fetch()` calls in try/catch
- Add user-facing error toasts using `expo-haptics`
- Add visual feedback on QR scan (success/failure overlays)
- Add loading skeletons to parking dashboard
- Handle offline case gracefully
- Improve error messages in alerts

### Error Handling Pattern

```typescript
// utils/errorHandler.ts
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

export async function handleApiCall<T>(
  apiCall: () => Promise<T>,
  options: {
    successMessage?: string;
    errorMessage?: string;
    showHaptic?: boolean;
  } = {}
): Promise<T | null> {
  try {
    const result = await apiCall();
    if (options.showHaptic) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    return result;
  } catch (error) {
    console.error('API Error:', error);
    if (options.showHaptic) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    Alert.alert('Error', options.errorMessage || 'Something went wrong');
    return null;
  }
}
```

**Non-breaking:** Error handling is additive. Existing flows work the same, just with better UX.

---

## Area 6: Testing (Quality Assurance)

### Changes

- Add `jest` + `jest-expo` configuration
- Write unit tests for QR validation logic
- Write integration tests for 3 role flows
- Add test scripts to `package.json`
- Mock Clerk sessions for testing
- Test database operations

### Test Structure

```
__tests__/
├── unit/
│   ├── qr-validation.test.ts
│   ├── token-generation.test.ts
│   └── database-operations.test.ts
├── integration/
│   ├── student-flow.test.ts
│   ├── admin-flow.test.ts
│   └── superadmin-flow.test.ts
└── setup.ts
```

### Example Test

```typescript
// __tests__/unit/qr-validation.test.ts
import { validateQRToken } from '../utils/qrValidation';

describe('QR Token Validation', () => {
  it('should validate a correctly signed token', () => {
    const token = createTestToken();
    const result = validateQRToken(token);
    expect(result.valid).toBe(true);
  });

  it('should reject expired tokens', () => {
    const token = createExpiredToken();
    const result = validateQRToken(token);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Token expired');
  });
});
```

**Non-breaking:** Tests are additive and don't affect production code.

---

## Area 7: Documentation (Knowledge)

### Changes

- Add `npm run seed:superadmin` script
- Add JSDoc comments to context providers and hooks
- Document ScanEvent lifecycle
- Update README with new scripts
- Add API documentation
- Document environment setup

### Seed Script

```typescript
// scripts/seedSuperadmin.ts
import db from '../backend/database';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter email to promote to superadmin: ', (email) => {
  db.run('UPDATE Users SET role = ? WHERE email = ?', ['superadmin', email], (err) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log(`User ${email} promoted to superadmin`);
    }
    rl.close();
  });
});
```

**Non-breaking:** Documentation changes don't affect code behavior.

---

## Implementation Order

1. **Security** - Foundation for all other work
2. **TypeScript** - Type safety enables better architecture
3. **Architecture** - Clean structure makes testing easier
4. **Expo/React Native** - Platform improvements
5. **Error Handling & UX** - Better user experience
6. **Testing** - Quality assurance on improved codebase
7. **Documentation** - Knowledge capture

---

## Success Criteria

- All security vulnerabilities addressed
- TypeScript strict mode enabled with zero errors
- Backend properly structured with typed routes
- All Expo packages verified compatible
- Error handling comprehensive with user feedback
- Test coverage > 70% for critical paths
- Documentation complete and up-to-date

---

## Rollback Strategy

Each area is self-contained and can be rolled back independently:

- Security: Revert `.gitignore` and config changes
- TypeScript: Disable strict mode temporarily
- Architecture: Keep old files alongside new ones
- Expo: Remove added packages
- Error Handling: Remove try/catch blocks
- Testing: Remove test files
- Documentation: Revert documentation changes

---

## Notes

- All changes are non-breaking by design
- Existing API contracts remain unchanged
- Database schema updates are additive only
- User-facing changes are improvements, not breaking changes
- Testing ensures regressions are caught early
