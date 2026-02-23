# Zip Code Coordinate Verification

## Current Zip Codes in Map

| # | ZIP | City | Current Lat | Current Lng | Status |
|---|-----|------|-------------|-------------|--------|
| 1 | 98070 | Vashon | 47.4474 | -122.4598 | ✅ Vashon Island - Correct |
| 2 | 98321 | Buckley | 47.1623 | -122.0260 | ⚠️ Verify - Should be further east |
| 3 | 98323 | Carbonado | 47.0804 | -122.0515 | ⚠️ Verify - Should be southeast |
| 4 | 98385 | South Prairie | 47.1376 | -122.0940 | ⚠️ Verify |
| 5 | 98391 | Lake Tapps | 47.1963 | -122.1690 | ⚠️ Verify |
| 6 | 98396 | Wilkeson | 47.1054 | -122.0468 | ⚠️ Verify |
| 7 | 98403 | Tacoma | 47.2626 | -122.4483 | ✅ Central Tacoma |
| 8 | 98404 | Tacoma | 47.2151 | -122.4123 | ✅ East Tacoma |
| 9 | 98406 | Tacoma | 47.2646 | -122.5149 | ✅ West Tacoma |
| 10 | 98407 | Ruston | 47.2994 | -122.5155 | ✅ North Tacoma/Ruston |
| 11 | 98413 | Tacoma | 47.2529 | -122.4443 | ⚠️ Near 98403 - may overlap |
| 12 | 98416 | Tacoma | 47.2618 | -122.4807 | ⚠️ Near 98406 - may overlap |
| 13 | 98443 | Tacoma | 47.2025 | -122.3649 | ⚠️ Northeast Tacoma - verify |
| 14 | 98447 | Tacoma | 47.1871 | -122.3450 | ❌ **TOO FAR EAST** - This is near 98444 |

## Issues Found

### 98447 (Midland) - NEEDS FIX
**Current coordinates (47.1871, -122.3450) are incorrect.**

These coordinates put the pin in the **Parkland area (98444)**, not Midland (98447).

**Correct coordinates for 98447 (Midland):**
- Lat: ~47.1650
- Lng: ~-122.4150

Midland is south of downtown Tacoma, near the intersection of I-5 and Highway 512.

## Recommended Fixes

```javascript
// CORRECTED coordinates
const territories = [
    { zip: '98070', city: 'Vashon', lat: 47.4474, lng: -122.4598 },      // ✅ OK
    { zip: '98321', city: 'Buckley', lat: 47.1623, lng: -122.0260 },      // ⚠️ Check
    { zip: '98323', city: 'Carbonado', lat: 47.0804, lng: -122.0515 },    // ⚠️ Check
    { zip: '98385', city: 'South Prairie', lat: 47.1376, lng: -122.0940 },// ⚠️ Check
    { zip: '98391', city: 'Lake Tapps', lat: 47.1963, lng: -122.1690 },   // ⚠️ Check
    { zip: '98396', city: 'Wilkeson', lat: 47.1054, lng: -122.0468 },     // ⚠️ Check
    { zip: '98403', city: 'Tacoma', lat: 47.2626, lng: -122.4483 },       // ✅ OK
    { zip: '98404', city: 'Tacoma', lat: 47.2151, lng: -122.4123 },       // ✅ OK
    { zip: '98406', city: 'Tacoma', lat: 47.2646, lng: -122.5149 },       // ✅ OK
    { zip: '98407', city: 'Ruston', lat: 47.2994, lng: -122.5155 },       // ✅ OK
    { zip: '98413', city: 'Tacoma', lat: 47.2529, lng: -122.4443 },       // ⚠️ May overlap with 98403
    { zip: '98416', city: 'Tacoma', lat: 47.2618, lng: -122.4807 },       // ⚠️ May overlap with 98406
    { zip: '98443', city: 'Tacoma', lat: 47.2025, lng: -122.3649 },       // ✅ OK (NE Tacoma)
    { zip: '98447', city: 'Tacoma', lat: 47.1650, lng: -122.4150 },       // ❌ FIXED (Midland)
];
```

## Action Required

1. Fix 98447 coordinates (most urgent)
2. Verify Buckley, Carbonado, South Prairie, Lake Tapps, Wilkeson coordinates
3. Consider removing overlapping zip codes (98413, 98416) or verify they're needed

## How to Verify

1. Go to Google Maps
2. Search "[ZIP] Tacoma WA"
3. Right-click center of area
4. Copy coordinates
5. Update in comcast/index.html
