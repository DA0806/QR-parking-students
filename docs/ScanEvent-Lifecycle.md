# ScanEvent Lifecycle Documentation

## Overview

The ScanEvent lifecycle describes the complete flow of QR code scanning, validation, and access control in the Key Alumnos parking system.

## Components

### 1. QR Token Generation (Client-side)

**Location:** `app/(student)/qr.tsx`

**Process:**
1. Student app requests secret key from backend (once, stored in SecureStore)
2. App generates offline QR token using HMAC-SHA256
3. Token structure:
   ```typescript
   {
     payload: {
       userId: string,
       plate?: string,
       type?: 'pedestrian',
       timestamp: number
     },
     signature: string
   }
   ```
4. Token refreshes every 4.5 minutes (270 seconds)
5. QR code displays the JSON-encoded token

**Security:**
- Secret key stored securely in device SecureStore
- HMAC signature prevents token tampering
- Timestamp prevents replay attacks (5-minute window)

### 2. QR Token Scanning (Admin-side)

**Location:** `app/(admin)/scan.tsx`

**Process:**
1. Admin selects parking zone
2. Camera scans QR code
3. Token extracted from QR code
4. Token sent to backend for validation

**UX Features:**
- Visual feedback on scan success/failure
- Haptic feedback using expo-haptics
- 4-second cooldown between scans
- Zone selector for multi-zone parking

### 3. Token Validation (Backend)

**Location:** `backend/index.ts` - `/api/events/scan` endpoint

**Validation Steps:**
1. Parse token JSON
2. Verify token structure (payload + signature)
3. Lookup user's secret key from database
4. Verify timestamp (within 5 minutes, not in future)
5. Recalculate HMAC signature with secret key
6. Compare signatures to verify integrity

**Error Cases:**
- Invalid JSON format → 400 Bad Request
- Missing required fields → 400 Bad Request
- User not found or no secret → 401 Unauthorized
- Token expired → 401 Unauthorized
- Invalid signature → 401 Unauthorized

### 4. Access Control Logic

**Location:** `backend/index.ts` - `/api/events/scan` endpoint

**Process:**
1. Determine if entry or exit:
   - Check last event for vehicle plate
   - If no last event or last was EXIT → ENTRY
   - If last was ENTRY → EXIT

2. For ENTRY:
   - Check zone capacity
   - If full → 400 Bad Request
   - Increment zone occupancy (+1)
   - Create ENTRY event

3. For EXIT:
   - Decrement zone occupancy (-1)
   - Create EXIT event

4. For pedestrians:
   - No capacity check
   - No occupancy change
   - Create event for tracking

**Database Operations:**
```sql
-- Get last event
SELECT event_type FROM AccessEvents 
WHERE vehicle_plate = ? 
ORDER BY timestamp DESC LIMIT 1

-- Get zone capacity
SELECT current_occupancy, total_capacity FROM Zones WHERE id = ?

-- Create event
INSERT INTO AccessEvents (vehicle_plate, zone_id, event_type) 
VALUES (?, ?, ?)

-- Update occupancy
UPDATE Zones SET current_occupancy = MAX(0, current_occupancy + ?) 
WHERE id = ?
```

### 5. Response Handling

**Success Response:**
```json
{
  "success": true,
  "eventType": "ENTRY",
  "vehicle_plate": "ABC-123",
  "isEntry": true
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Security Considerations

### Token Security
- Secret keys are 32-character hex strings (128 bits)
- HMAC-SHA256 provides cryptographic integrity
- Timestamp prevents replay attacks
- 5-minute window balances security and usability

### Rate Limiting
- QR generation: 10 requests per minute per IP
- Scan requests: 30 requests per minute per IP

### Input Validation
- All API endpoints use express-validator
- SQL queries use parameterized statements
- No string concatenation in database operations

## Error Handling

### Client-side
- Network errors detected and displayed
- User-friendly error messages
- Haptic feedback for errors
- Graceful degradation when offline

### Backend
- Comprehensive error logging
- Proper HTTP status codes
- Error messages in Spanish for users
- Transaction rollback on database errors

## Testing

### Unit Tests
- Error handler utilities
- API client methods
- Token validation logic

### Integration Tests
- Complete scan flow
- Entry/exit logic
- Capacity enforcement
- Error scenarios

## Performance

### Client-side
- QR token generation: < 100ms
- QR code rendering: < 200ms
- Token refresh: Every 4.5 minutes

### Backend
- Token validation: < 50ms
- Database operations: < 100ms
- Total scan time: < 200ms

## Monitoring

### Key Metrics
- Scan success rate
- Average scan time
- Error rate by type
- Zone occupancy trends

### Logging
- All scan attempts logged
- Errors logged with context
- Performance metrics tracked
