# Category Database Structure

## MongoDB Collections

### Categories Collection Examples

```javascript
// CCTV Camera Category
{
  "_id": ObjectId("..."),
  "name": "CCTV Camera",
  "description": "CCTV Camera products and solutions",
  "subcategories": [],
  "isActive": true,
  "createdAt": ISODate("2026-02-02T..."),
  "updatedAt": ISODate("2026-02-02T...")
}

// Biometric Devices Category
{
  "_id": ObjectId("..."),
  "name": "Biometric Devices",
  "description": "Biometric Devices products and solutions",
  "subcategories": [],
  "isActive": true,
  "createdAt": ISODate("2026-02-02T..."),
  "updatedAt": ISODate("2026-02-02T...")
}
```

### Subcategories Collection Examples

```javascript
// Level 1: IP Camera
{
  "_id": ObjectId("..."),
  "name": "IP Camera",
  "category": "CCTV Camera",
  "description": "IP Camera under CCTV Camera",
  "icon": "",
  "createdAt": ISODate("2026-02-02T..."),
  "updatedAt": ISODate("2026-02-02T...")
}

// Level 2: IP Camera - Camera
{
  "_id": ObjectId("..."),
  "name": "IP Camera - Camera",
  "category": "CCTV Camera",
  "description": "Camera variants of IP Camera",
  "icon": "",
  "createdAt": ISODate("2026-02-02T..."),
  "updatedAt": ISODate("2026-02-02T...")
}

// Level 3: IP Camera - Camera - 2 MP IP Camera
{
  "_id": ObjectId("..."),
  "name": "IP Camera - Camera - 2 MP IP Camera",
  "category": "CCTV Camera",
  "description": "2 MP IP Camera",
  "icon": "",
  "createdAt": ISODate("2026-02-02T..."),
  "updatedAt": ISODate("2026-02-02T...")
}

// Level 3: IP Camera - Camera - 4 MP IP Camera
{
  "_id": ObjectId("..."),
  "name": "IP Camera - Camera - 4 MP IP Camera",
  "category": "CCTV Camera",
  "description": "4 MP IP Camera",
  "icon": "",
  "createdAt": ISODate("2026-02-02T..."),
  "updatedAt": ISODate("2026-02-02T...")
}

// Level 3: IP Camera - Camera - 6 MP IP Camera
{
  "_id": ObjectId("..."),
  "name": "IP Camera - Camera - 6 MP IP Camera",
  "category": "CCTV Camera",
  "description": "6 MP IP Camera",
  "icon": "",
  "createdAt": ISODate("2026-02-02T..."),
  "updatedAt": ISODate("2026-02-02T...")
}

// Level 2: IP Camera - NVR
{
  "_id": ObjectId("..."),
  "name": "IP Camera - NVR",
  "category": "CCTV Camera",
  "description": "NVR variants of IP Camera",
  "icon": "",
  "createdAt": ISODate("2026-02-02T..."),
  "updatedAt": ISODate("2026-02-02T...")
}

// Level 3: IP Camera - NVR - 4 CH
{
  "_id": ObjectId("..."),
  "name": "IP Camera - NVR - 4 CH",
  "category": "CCTV Camera",
  "description": "4 CH",
  "icon": "",
  "createdAt": ISODate("2026-02-02T..."),
  "updatedAt": ISODate("2026-02-02T...")
}
```

## Complete Structure Tree

```
CCTV Camera (Main)
├── IP Camera
│   ├── IP Camera - Camera
│   │   ├── IP Camera - Camera - 2 MP IP Camera
│   │   ├── IP Camera - Camera - 4 MP IP Camera
│   │   └── IP Camera - Camera - 6 MP IP Camera
│   ├── IP Camera - NVR
│   │   ├── IP Camera - NVR - 4 CH
│   │   ├── IP Camera - NVR - 8 CH
│   │   ├── IP Camera - NVR - 16 CH
│   │   └── IP Camera - NVR - 22 CH
│   └── IP Camera - POE
│       ├── IP Camera - POE - 4 CH
│       ├── IP Camera - POE - 8 CH
│       └── IP Camera - POE - 16 CH
├── HD Camera
│   ├── HD Camera - Camera
│   │   ├── HD Camera - Camera - 2 MP
│   │   ├── HD Camera - Camera - 4 MP
│   │   └── HD Camera - Camera - 6 MP
│   ├── HD Camera - SMPS
│   │   ├── HD Camera - SMPS - 4 CH
│   │   ├── HD Camera - SMPS - 8 CH
│   │   └── HD Camera - SMPS - 16 CH
│   └── HD Camera - DVR
│       ├── HD Camera - DVR - 4 CH
│       ├── HD Camera - DVR - 8 CH
│       ├── HD Camera - DVR - 16 CH
│       └── HD Camera - DVR - 32 CH
├── Wi-Fi/4G Camera
└── CCTV Bundle Pack

Biometric Devices (Main)
├── Fingerprint Biometric
├── Face Recognition Biometric
├── Card + Fingerprint Devices
└── Time Attendance with Payroll Integration

Intercom System (Main)
├── EPBX
└── IPBX

Home & Office Security (Main)
├── Video Door Phone (VDP/VPP)
├── Smart Door Locks
├── Access Control System
├── Alarm Systems
└── Motion Sensors

Fire Alarm Systems (Main)
├── Smoke Detectors
├── Heat Detectors
├── Manual Call Points
└── Control Panels
```

## How Frontend Parses This

The frontend receives this data from the API and parses it as follows:

1. **Fetches all categories** from `/api/categories`
2. **Fetches all subcategories** from `/api/subcategories`
3. **Groups subcategories** by checking the `category` field
4. **Builds hierarchy** by splitting the name on " - ":
   - `"IP Camera"` → Level 1
   - `"IP Camera - Camera"` → Level 2
   - `"IP Camera - Camera - 2 MP IP Camera"` → Level 3

This creates a tree structure like:
```javascript
{
  id: "...",
  name: "IP Camera",
  subcategories: [
    {
      id: "...",
      name: "Camera",
      children: [
        { id: "...", name: "2 MP IP Camera" },
        { id: "...", name: "4 MP IP Camera" },
        { id: "...", name: "6 MP IP Camera" }
      ]
    },
    {
      id: "...",
      name: "NVR",
      children: [
        { id: "...", name: "4 CH" },
        { id: "...", name: "8 CH" },
        { id: "...", name: "16 CH" },
        { id: "...", name: "22 CH" }
      ]
    },
    {
      id: "...",
      name: "POE",
      children: [
        { id: "...", name: "4 CH" },
        { id: "...", name: "8 CH" },
        { id: "...", name: "16 CH" }
      ]
    }
  ]
}
```

## Total Document Count After Seeding

- **Categories**: 5 (CCTV Camera, Biometric Devices, Intercom System, Home & Office Security, Fire Alarm Systems)
- **Subcategories**: ~90+ (includes all levels of the hierarchy)

This structure provides flexibility for:
- Multiple levels of categorization
- Easy filtering and navigation
- Admin product assignment with clear hierarchy
- Future scalability
