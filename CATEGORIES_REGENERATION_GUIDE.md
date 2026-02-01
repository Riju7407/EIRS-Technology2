# Categories & Subcategories Regeneration Guide

## New Hierarchical Structure

The categories have been regenerated with the following new hierarchical structure:

### 1. CCTV Camera
- **IP Camera**
  - Camera (2 MP, 4 MP, 6 MP)
  - NVR (4 CH, 8 CH, 16 CH, 22 CH)
  - POE (4 CH, 8 CH, 16 CH)
- **HD Camera**
  - Camera (2 MP, 4 MP, 6 MP)
  - SMPS (4 CH, 8 CH, 16 CH)
  - DVR (4 CH, 8 CH, 16 CH, 32 CH)
- **Wi-Fi/4G Camera**
- **CCTV Bundle Pack**

### 2. Biometric Devices
- Fingerprint Biometric
- Face Recognition Biometric
- Card + Fingerprint Devices
- Time Attendance with Payroll Integration

### 3. Intercom System
- EPBX
- IPBX

### 4. Home & Office Security
- Video Door Phone (VDP/VPP)
- Smart Door Locks
- Access Control System
- Alarm Systems
- Motion Sensors

### 5. Fire Alarm Systems
- Smoke Detectors
- Heat Detectors
- Manual Call Points
- Control Panels

## Files Updated

### Backend
1. **server/seedCategories.js** - New seed script with hierarchical data structure
2. **server/model/categorySchema.js** - Already supports the structure
3. **server/model/subcategorySchema.js** - Already supports the structure

### Frontend
1. **client/src/context/CategoryFilterContext.js** - Fetches categories and subcategories from API
2. **client/src/components/CategorySidebar.js** - Updated to display hierarchical structure with nested children

## How to Apply the Changes

### Step 1: Run the Seed Script
```bash
cd server
node seedCategories.js
```

This will:
- Clear existing categories and subcategories
- Create the 5 main categories
- Create all subcategories with the new hierarchical structure
- Store the relationships properly in MongoDB

### Step 2: Verify in Frontend
The frontend will automatically:
- Fetch categories from the API
- Display them in the new hierarchical format in the Categories & Filters sidebar
- Support nested selection (users can select parent categories or specific child items)

## Admin Product Management

When admins add or edit products, they can now:
1. Select the main category (e.g., "CCTV Camera")
2. Select the subcategory (e.g., "IP Camera")
3. Select specific child items (e.g., "Camera", "NVR", "POE")

## Database Schema

### Categories Collection
```javascript
{
  _id: ObjectId,
  name: String,           // e.g., "CCTV Camera"
  description: String,
  subcategories: Array,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Subcategories Collection
```javascript
{
  _id: ObjectId,
  name: String,           // e.g., "IP Camera - Camera - 2 MP IP Camera"
  category: String,       // Reference to parent category name
  description: String,
  icon: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Note
The subcategory names follow a naming convention to support the hierarchy:
- Top-level: "IP Camera"
- Level 2: "IP Camera - Camera"
- Level 3: "IP Camera - Camera - 2 MP IP Camera"

This allows the frontend to parse the relationships using string splitting on " - ".
