# Visual Guide - Dynamic Filters System Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                                                                 │
│  /products  |  /services  |  /about                            │
│     ↓           ↓            ↓                                  │
│  ┌──────────────────────────────────────┐                      │
│  │    Categories & Filters Sidebar      │                      │
│  ├──────────────────────────────────────┤                      │
│  │ • Categories (Dynamic from API)      │                      │
│  │   └─ Subcategories (Dynamic)         │                      │
│  │ • Price Range                        │                      │
│  │ • Brands (Dynamic from API)          │                      │
│  │ • Resolutions (Dynamic from API)     │                      │
│  │ • NVR Channels (Dynamic from API)    │                      │
│  │ • Custom Filters (Dynamic from API)  │                      │
│  └──────────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
                           ↑
                           │
                    [CategorySidebar.js]
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                  CONTEXT LAYER (React)                          │
│                                                                 │
│            [CategoryFilterContext.js]                          │
│                                                                 │
│  State:                                                         │
│  • categories (Array)                                          │
│  • subcategories (Array)                                       │
│  • filters (Array)                                             │
│  • loading (Boolean)                                           │
│  • refetchData() (Function)                                    │
│                                                                 │
│  Data Flow:                                                     │
│  useEffect() → fetchAllData() → API Calls                     │
└─────────────────────────────────────────────────────────────────┘
                           ↑
                           │
                    API Calls (axios)
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND - Express                          │
│                      REST API Layer                             │
│                                                                 │
│  Routes (categoryRouter.js):                                   │
│  ├─ GET  /api/categories        → getAllCategories()         │
│  ├─ GET  /api/subcategories     → getAllSubcategories()      │
│  ├─ GET  /api/filters           → getAllFilters()            │
│  ├─ GET  /api/filters/:type     → getFilterByType()          │
│  ├─ POST /api/filters           → createFilter()             │
│  ├─ PUT  /api/filters/:id       → updateFilter()             │
│  ├─ DELETE /api/filters/:id     → deleteFilter()             │
│  └─ PATCH /api/filters/:id/toggle → toggleFilterStatus()     │
│                                                                 │
│  Controllers:                                                   │
│  • categoryController.js (categories & subcategories)         │
│  • filterController.js (filters management)                   │
└─────────────────────────────────────────────────────────────────┘
                           ↑
                           │
                      Database Queries
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                             │
│                                                                 │
│  Collections:                                                   │
│  ├─ categories                                                 │
│  │  ├─ _id, name, description, isActive, timestamps          │
│  │                                                             │
│  ├─ subcategories                                             │
│  │  ├─ _id, name, categoryId, categoryName, isActive,        │
│  │  └─ timestamps                                             │
│  │                                                             │
│  └─ filters                                                    │
│     ├─ _id, name, type, options[{label, value}],             │
│     ├─ description, isActive, displayOrder, timestamps        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Admin Panel Flow

```
┌──────────────────┐
│  Admin Login     │
│  /signin         │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────┐
│   Admin Dashboard                │
│   /admin/dashboard               │
│                                  │
│  Sidebar Menu:                   │
│  • Dashboard ✓                   │
│  • Users                         │
│  • Enquiries                     │
│  • Products                      │
│  • Categories                    │
│  • Subcategories                 │
│  • Filters ← [NEW]              │
│  • Services                      │
│  • Orders                        │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────┐
│   AdminFilters Component                 │
│   /admin/filters                         │
│                                          │
│   Actions:                               │
│   ├─ View All Filters                   │
│   ├─ Create New Filter                  │
│   ├─ Edit Filter                        │
│   ├─ Delete Filter                      │
│   ├─ Add/Remove Options                 │
│   └─ Toggle Status                      │
└────────┬─────────────────────────────────┘
         │
         ↓ (API Call with Admin Token)
┌──────────────────────────────────────────┐
│   Backend API Endpoints                  │
│                                          │
│   POST   /api/filters                    │
│   PUT    /api/filters/:id                │
│   DELETE /api/filters/:id                │
│   PATCH  /api/filters/:id/toggle         │
└────────┬─────────────────────────────────┘
         │
         ↓ (Save to Database)
┌──────────────────────────────────────────┐
│   MongoDB - Filter Collection            │
│                                          │
│   {                                      │
│     _id, name, type, options[],         │
│     description, isActive, displayOrder  │
│   }                                      │
└──────────────────────────────────────────┘
```

---

## User Visibility Flow

```
┌────────────────────────────────┐
│   User Visits /products        │
│   or /services                 │
│   or /about                    │
└────────┬───────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│   React App Loads                      │
│   App → Routes → Page Component        │
└────────┬───────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│   CategoryFilterProvider Wrapper        │
│   (wraps entire app)                   │
└────────┬───────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│   useEffect() triggers in context      │
│   Calls fetchAllData()                 │
└────────┬───────────────────────────────┘
         │
         ├─→ GET /api/categories      ├─→ setCategories()
         ├─→ GET /api/subcategories   ├─→ setSubcategories()
         └─→ GET /api/filters         └─→ setFilters()
         │
         ↓
┌────────────────────────────────────────┐
│   CategorySidebar Component            │
│   (Consumes context data)              │
│                                        │
│   Builds UI:                           │
│   • Maps through categories            │
│   • Shows subcategories under each     │
│   • Maps through filters               │
│   • Displays filter options            │
└────────┬───────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│   User Sees Sidebar with:              │
│   ✓ Categories & Subcategories        │
│   ✓ Price Range                       │
│   ✓ Brands Filter                     │
│   ✓ Resolutions Filter                │
│   ✓ NVR Channels Filter               │
│   ✓ Any Custom Filters                │
│                                        │
│   All populated from Database!         │
└────────────────────────────────────────┘
```

---

## Data Structure Diagram

### Category
```
┌─────────────────────────────────────┐
│         Category                    │
├─────────────────────────────────────┤
│ _id: ObjectId                       │
│ name: "CCTV Cameras"                │
│ description: "..."                  │
│ isActive: true                      │
│ createdAt: ISODate                  │
│ updatedAt: ISODate                  │
└─────────────────────────────────────┘
```

### Subcategory (Linked to Category)
```
┌──────────────────────────────────────────┐
│         Subcategory                      │
├──────────────────────────────────────────┤
│ _id: ObjectId                            │
│ name: "IP Camera Solutions"              │
│ categoryId: ObjectId (→ Category._id)    │
│ categoryName: "CCTV Cameras"             │
│ description: "..."                       │
│ isActive: true                           │
│ createdAt: ISODate                       │
│ updatedAt: ISODate                       │
└──────────────────────────────────────────┘
```

### Filter (Multiple Options)
```
┌────────────────────────────────────────────┐
│         Filter                             │
├────────────────────────────────────────────┤
│ _id: ObjectId                              │
│ name: "Camera Brands"                      │
│ type: "brand"                              │
│                                            │
│ options: [                                 │
│   { label: "HIKVISION", value: "hikvi" }, │
│   { label: "DAHUA", value: "dahua" },     │
│   { label: "UNIVIEW", value: "uniview" }  │
│ ]                                          │
│                                            │
│ description: "Brand options"               │
│ isActive: true                             │
│ displayOrder: 1                            │
│ createdAt: ISODate                         │
│ updatedAt: ISODate                         │
└────────────────────────────────────────────┘
```

---

## State Management in React

```
App
  │
  └─ CategoryFilterProvider
      │
      ├─ State:
      │  ├─ isSidebarOpen
      │  ├─ categories []
      │  ├─ subcategories []
      │  ├─ filters []
      │  ├─ loading
      │  └─ error
      │
      ├─ Functions:
      │  ├─ fetchAllData()
      │  ├─ toggleSidebar()
      │  ├─ closeSidebar()
      │  ├─ openSidebar()
      │  └─ refetchData()
      │
      ├─ Provides via Context:
      │  └─ value={{...all above}}
      │
      └─ Wraps all children
         │
         ├─ Header
         ├─ MainRoutes
         │  ├─ ProductsPage
         │  ├─ ServicesPage
         │  └─ AboutPage
         │     └─ CategorySidebar (consumes context)
         └─ Footer
```

---

## API Call Sequence Diagram

```
User Action          Request                Response              Update
─────────────────────────────────────────────────────────────────────────

1. Page Load
   App Init         ─────────────────→
   
   [useEffect      GET /api/categories    ← {categories[]}     setCategories()
    triggers]      GET /api/subcategories ← {subcategories[]}  setSubcategories()
                   GET /api/filters       ← {filters[]}        setFilters()
                   
                                                                ↓
2. Sidebar Renders with Categories + Filters
   (Uses state from context)
   
3. Admin Creates Filter
   AdminFilters    POST /api/filters      ← {success, data}    Show Success ✓
                   [with Auth Header]     [saved to DB]

4. User Refreshes Page
   App loads again GET /api/filters       ← {includes new      New filter
                  (calls fetchAllData)      filter}             appears! ✓
   
5. Sidebar Auto-Updates
   (gets new filter from context)
```

---

## Authentication Flow

```
┌────────────────┐
│   Login Page   │
│   /signin      │
└────────┬───────┘
         │
         ↓
    [Submit Credentials]
         │
         ↓
┌─────────────────────────────────┐
│   POST /api/auth/login          │
│   (server validates)            │
└────────┬────────────────────────┘
         │
         ↓ Success
┌─────────────────────────────────┐
│   Return:                       │
│   • token (JWT)                 │
│   • user (admin info)           │
│   • role: "admin"               │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│   localStorage:                 │
│   • Save token                  │
│   • Save user data              │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│   All API Requests:             │
│   Header: {                     │
│     Authorization: Bearer TOKEN │
│   }                             │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│   Server Middleware:            │
│   • verifyToken() [check JWT]   │
│   • verifyAdmin() [check role]  │
│   ✓ Request allowed             │
│   ✗ Request denied              │
└─────────────────────────────────┘
```

---

## Real-Time Update Mechanism

```
Timeline:

T=0
Admin at /admin/filters page
User at /products page

T=1
Admin creates new "BOSCH" brand filter
POST /api/filters
[Saved to DB]
✓ Success message shown to Admin

T=2
Admin's filter list updates
Shows new filter in table

T=3 (User still on products page)
Filters show old data (API was called before)
Old filters + brands displayed

T=4
User refreshes page (Ctrl+F5)
App calls fetchAllData()
GET /api/filters
← Returns including new "BOSCH" filter

T=5
CategorySidebar re-renders
New "BOSCH" filter appears in sidebar!
User can now use it ✓

Alternative (Instant Update):
After T=1, if admin calls refetchData()
Or if periodic polling is enabled
Changes visible immediately
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    AdminDashboard                           │
│  (Navigation Hub)                                           │
│                                                             │
│  Links:                                                    │
│  ├─ /admin/categories     → AdminCategories component     │
│  ├─ /admin/subcategories  → AdminSubcategories component  │
│  ├─ /admin/filters        → AdminFilters component [NEW]  │
│  └─ Other admin pages...                                  │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────────────┐
│   AdminFilters Component       │
│                                │
│   • useContext(useCategoryFilter) [optional for refetch]
│   • useState for form data     │
│   • axios for API calls        │
│   • Renders form for CRUD      │
│   • Displays filter list       │
│   • Error/Success messages     │
└────────────────────────────────┘
        │
        ↓ (API calls)
┌────────────────────────────────┐
│   filterController.js          │
│                                │
│   • createFilter()             │
│   • updateFilter()             │
│   • deleteFilter()             │
│   • getAllFilters()            │
│   • toggleFilterStatus()       │
└────────────────────────────────┘
        │
        ↓ (DB operations)
┌────────────────────────────────┐
│   MongoDB Filter Schema        │
│                                │
│   Stores and retrieves         │
│   filter documents             │
└────────────────────────────────┘


┌────────────────────────────────┐
│   CategorySidebar Component    │
│                                │
│   • useContext(useCategoryFilter)
│   • Consumes categories []     │
│   • Consumes filters []        │
│   • Consumes subcategories []  │
│   • Renders dynamic UI         │
│   • Handles user selections    │
└────────────────────────────────┘
        │
        ↑ (Context data)
┌────────────────────────────────┐
│   CategoryFilterContext        │
│                                │
│   • useEffect fetches API data │
│   • Stores in state            │
│   • Provides to all consumers  │
│   • refetchData() for updates  │
└────────────────────────────────┘
```

---

## Summary

The system follows a clean **separation of concerns**:

1. **Frontend (React)**
   - Components handle UI
   - Context handles data
   - Components consume context

2. **Backend (Express)**
   - Routes handle requests
   - Controllers handle logic
   - Middleware handles auth

3. **Database (MongoDB)**
   - Stores actual data
   - Collections: categories, subcategories, filters

4. **Communication (REST API)**
   - Clean endpoints
   - JSON request/response
   - Proper error handling
   - Token authentication

**Status:** ✅ Production Ready

---

**Last Updated:** January 31, 2026
