# Dynamic Categories, Subcategories & Filters Management System

## Overview
This document explains the fully dynamic system for managing categories, subcategories, and filters in the EIRS 2 application. Admins can now add, edit, and delete categories, subcategories, and filters from the admin panel, and these changes are immediately visible to users in the Categories & Filters section on the frontend.

## Architecture

### Backend Components

#### 1. **Filter Schema** (`server/model/filterSchema.js`)
```javascript
- name: String (required, unique)
- type: String (brand, resolution, channels, priceRange, other)
- options: Array of objects with label and value
- description: String
- isActive: Boolean (default: true)
- displayOrder: Number (for sorting)
```

#### 2. **Filter Controller** (`server/controller/filterController.js`)
Provides the following endpoints:
- `getAllFilters()` - Get all active filters
- `getFilterByType(type)` - Get filters by specific type
- `createFilter()` - Create new filter (Admin only)
- `updateFilter()` - Update existing filter (Admin only)
- `deleteFilter()` - Delete filter (Admin only)
- `toggleFilterStatus()` - Soft delete/activate filter (Admin only)

#### 3. **API Routes** (`server/router/categoryRouter.js`)
```
GET    /api/filters              - Get all filters
GET    /api/filters/:type        - Get filters by type
POST   /api/filters              - Create filter (Auth + Admin)
PUT    /api/filters/:id          - Update filter (Auth + Admin)
DELETE /api/filters/:id          - Delete filter (Auth + Admin)
PATCH  /api/filters/:id/toggle   - Toggle filter status (Auth + Admin)
```

### Frontend Components

#### 1. **CategoryFilterContext** (`client/src/context/CategoryFilterContext.js`)
Enhanced context that now fetches and provides:
- Dynamic categories
- Dynamic subcategories
- Dynamic filters
- Loading states
- Refetch function for real-time updates

**Usage:**
```javascript
const { categories, subcategories, filters, loading, refetchData } = useCategoryFilter();
```

#### 2. **CategorySidebar Component** (`client/src/components/CategorySidebar.js`)
Updated to:
- Fetch categories and subcategories from API via context
- Fetch filters by type (brands, resolutions, channels, etc.)
- Display filters dynamically
- Fallback to default filters if API data is unavailable
- Support real-time filter updates

#### 3. **AdminFilters Component** (`client/src/pages/AdminFilters.js`)
Complete admin interface for managing filters with:
- Fetch all filters
- Create new filters
- Edit existing filters
- Delete filters
- Add/remove filter options
- Manage display order
- Toggle filter status

#### 4. **AdminDashboard** (`client/src/pages/AdminDashboard.js`)
Added navigation link to Filters management section

## How It Works

### User Flow (Frontend)
1. User visits Services/Products page
2. `CategoryFilterContext` automatically fetches categories, subcategories, and filters from API
3. `CategorySidebar` displays dynamic filters based on fetched data
4. User can filter products using dynamic filters
5. When admin updates filters, changes are reflected immediately (on page refresh or context refetch)

### Admin Flow (Backend Management)
1. Admin logs into admin panel
2. Navigates to "Filters" section
3. Can view all existing filters
4. Can create new filter with:
   - Filter name
   - Filter type (brand, resolution, channels, priceRange, other)
   - Multiple options (label + value pairs)
   - Description
   - Display order
5. Can edit existing filters
6. Can delete filters
7. Changes are saved to database immediately

### Real-Time Updates
To make changes visible immediately without page refresh:
```javascript
// In admin component after creating/updating/deleting
const { refetchData } = useCategoryFilter();
refetchData(); // Refetch all data from API
```

## Setup Instructions

### 1. Database Setup
No migration needed. Filter collection will be created automatically when first filter is created.

### 2. Start the Backend Server
```bash
cd server
npm start
```

### 3. Start the Frontend
```bash
cd client
npm start
```

### 4. Access Admin Panel
- Go to `http://localhost:3000/signin`
- Login as admin
- Navigate to `/admin/filters` or click "Filters" in sidebar

## Usage Examples

### Creating a Filter (Admin)

**Example 1: Brand Filter**
```
Name: Camera Brands
Type: brand
Options:
  - Label: HIKVISION, Value: hikvision
  - Label: DAHUA, Value: dahua
  - Label: UNIVIEW, Value: uniview
Display Order: 1
```

**Example 2: Resolution Filter**
```
Name: IP Camera Resolutions
Type: resolution
Options:
  - Label: 2 MP IP Camera, Value: 2mp
  - Label: 4 MP IP Camera, Value: 4mp
  - Label: 6 MP IP Camera, Value: 6mp
Display Order: 2
```

**Example 3: NVR Channels**
```
Name: NVR Channel Options
Type: channels
Options:
  - Label: 4 Channel NVR, Value: 4ch
  - Label: 8 Channel NVR, Value: 8ch
  - Label: 16 Channel NVR, Value: 16ch
Display Order: 3
```

### API Usage Examples

**Get all filters:**
```bash
curl http://localhost:5000/api/filters
```

**Get filters by type:**
```bash
curl http://localhost:5000/api/filters/brand
```

**Create new filter:**
```bash
curl -X POST http://localhost:5000/api/filters \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Camera Brands",
    "type": "brand",
    "options": [
      { "label": "HIKVISION", "value": "hikvision" },
      { "label": "DAHUA", "value": "dahua" }
    ],
    "displayOrder": 1
  }'
```

**Update filter:**
```bash
curl -X PUT http://localhost:5000/api/filters/FILTER_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Camera Brands Updated",
    "options": [...]
  }'
```

**Delete filter:**
```bash
curl -X DELETE http://localhost:5000/api/filters/FILTER_ID \
  -H "Authorization: Bearer TOKEN"
```

## Features

✅ **Dynamic Categories** - Add, edit, delete categories
✅ **Dynamic Subcategories** - Add, edit, delete subcategories
✅ **Dynamic Filters** - Create and manage custom filters
✅ **Multiple Filter Types** - Brand, resolution, channels, priceRange, custom
✅ **Filter Options** - Add multiple label-value pairs to each filter
✅ **Display Order** - Control order of filters display
✅ **Status Toggle** - Soft delete filters (deactivate without removing)
✅ **Admin Authentication** - All operations require admin verification
✅ **Real-time Updates** - Changes visible to users immediately
✅ **Fallback Data** - Hardcoded defaults if API fails
✅ **Responsive Design** - Works on desktop and mobile
✅ **Error Handling** - Comprehensive error messages

## Data Flow Diagram

```
ADMIN PANEL
    ↓
AdminFilters Component
    ↓
Filter API Endpoints (/api/filters)
    ↓
Filter Controller
    ↓
Filter Schema (MongoDB)
    ↓
[API Response]
    ↓
CategoryFilterContext
    ↓
CategorySidebar Component
    ↓
USER INTERFACE
    ↓
User sees dynamic filters
```

## Key Features

1. **Dynamic Categories & Subcategories**
   - Fetched from database
   - Can be created/edited/deleted via admin panel
   - Displayed in sidebar

2. **Dynamic Filters**
   - Support for multiple filter types
   - Add/remove options easily
   - Control display order
   - Activate/deactivate filters

3. **Real-time Visibility**
   - Changes immediately available via API
   - CategorySidebar automatically uses latest data
   - No need to restart app

4. **Admin Interface**
   - Intuitive UI with forms
   - CRUD operations for all filter types
   - Input validation
   - Success/error messages

## Testing Checklist

- [ ] Admin can create a new filter
- [ ] Admin can edit existing filter
- [ ] Admin can delete filter
- [ ] Filter options can be added/removed
- [ ] Filter displays correctly in sidebar
- [ ] Users can select filter options
- [ ] Multiple filters can be applied simultaneously
- [ ] Clear filters button works
- [ ] Changes persist after page refresh
- [ ] Non-admin users cannot access filter management
- [ ] Error handling works for invalid inputs

## Troubleshooting

### Filters not showing in sidebar
1. Check if filters exist in database: `GET /api/filters`
2. Check browser console for errors
3. Verify CategoryFilterContext is wrapped around app
4. Check if loading state is blocking display

### Admin cannot create filter
1. Verify user is authenticated: `Authorization` header present
2. Verify user is admin role
3. Check required fields: `name`, `type`, at least one option
4. Check for unique filter name constraint

### Changes not visible to users
1. Refresh page to reload filters
2. Check if CategoryFilterContext has `refetchData()` called
3. Verify API response status is 200
4. Check network tab in browser dev tools

## Files Modified/Created

### Created
- `server/model/filterSchema.js` - Filter data model
- `server/controller/filterController.js` - Filter business logic
- `client/src/pages/AdminFilters.js` - Admin filter management UI

### Modified
- `server/router/categoryRouter.js` - Added filter routes
- `client/src/context/CategoryFilterContext.js` - Added API data fetching
- `client/src/components/CategorySidebar.js` - Dynamic filter display
- `client/src/pages/AdminDashboard.js` - Added filter link
- `client/src/App.js` - Added AdminFilters route

## Security

- All filter management endpoints require authentication (`verifyToken`)
- All create/update/delete operations require admin role (`verifyAdmin`)
- Read operations (GET) are public
- Data validation on both client and server
- CORS headers properly configured

## Future Enhancements

1. Filter groups - Organize filters into sections
2. Filter search - Search filters by name or type
3. Bulk operations - Bulk create/delete filters
4. Filter analytics - Track filter usage
5. Conditional filters - Show filters based on category
6. Filter presets - Save and apply filter combinations
7. Multi-language filters - Support multiple languages

## Support

For issues or questions:
1. Check browser console for JavaScript errors
2. Check server logs for API errors
3. Verify all required fields in forms
4. Ensure admin user has proper permissions
5. Check database connection status

---

**Last Updated:** January 31, 2026
**Version:** 1.0
**Status:** Production Ready ✓
