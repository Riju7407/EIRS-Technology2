# Category System Architecture & Flow Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         CategoryFilterContext (React Context)            │   │
│  │  - Fetches categories from API                            │   │
│  │  - Fetches subcategories from API                        │   │
│  │  - Maintains global state                                │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                                          │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │           CategorySidebar Component                       │   │
│  │  - Receives categories from context                      │   │
│  │  - Parses hierarchy (splits by " - ")                    │   │
│  │  - Builds nested tree structure                          │   │
│  │  - Renders with proper indentation                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           CategorySidebar.css Styling                     │   │
│  │  - Main category: normal padding                         │   │
│  │  - Subcategory: 40px left padding                        │   │
│  │  - Child item: 70px left padding                         │   │
│  │  - Hover effects & animations                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           ▲
                           │
                    HTTP Requests
                           │
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Node.js/Express)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            API Routes (categoryRouter.js)                │   │
│  │  - GET  /api/categories                                 │   │
│  │  - GET  /api/subcategories                              │   │
│  │  - POST /api/categories (Admin only)                    │   │
│  │  - PUT  /api/categories/:id (Admin only)                │   │
│  │  - DELETE /api/categories/:id (Admin only)              │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │                                            │
│  ┌──────────────────▼───────────────────────────────────────┐   │
│  │      Category Controller (categoryController.js)         │   │
│  │  - getAllCategories()                                    │   │
│  │  - getAllSubcategories()                                │   │
│  │  - createCategory()                                      │   │
│  │  - updateCategory()                                      │   │
│  │  - deleteCategory()                                      │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │                                            │
│  ┌──────────────────▼───────────────────────────────────────┐   │
│  │           MongoDB Database                               │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  Categories Collection                          │   │   │
│  │  │  - CCTV Camera                                  │   │   │
│  │  │  - Biometric Devices                            │   │   │
│  │  │  - Intercom System                              │   │   │
│  │  │  - Home & Office Security                       │   │   │
│  │  │  - Fire Alarm Systems                           │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  Subcategories Collection (90+ documents)       │   │   │
│  │  │  - IP Camera                                    │   │   │
│  │  │  - IP Camera - Camera                           │   │   │
│  │  │  - IP Camera - Camera - 2 MP IP Camera          │   │   │
│  │  │  - ... (all 3 levels)                          │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. APPLICATION START                                             │
│    - Browser loads React app                                    │
│    - CategoryFilterProvider wraps entire app                    │
│    - useEffect triggered in CategoryFilterContext               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. API FETCH                                                     │
│    - Fetch /api/categories                                      │
│    - Fetch /api/subcategories                                   │
│    - Fetch /api/filters                                         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. DATA RECEIVED                                                 │
│    Categories: [                                                 │
│      { _id: "1", name: "CCTV Camera", ... },                    │
│      { _id: "2", name: "Biometric Devices", ... },              │
│      ...                                                         │
│    ]                                                             │
│    Subcategories: [                                              │
│      { _id: "10", name: "IP Camera", category: "CCTV Camera" }, │
│      { _id: "11", name: "IP Camera - Camera", ... },            │
│      { _id: "12", name: "IP Camera - Camera - 2 MP IP Camera"...│
│      ...                                                         │
│    ]                                                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. CONTEXT STORES DATA                                           │
│    - categories: [array]                                        │
│    - subcategories: [array]                                     │
│    - filters: [array]                                           │
│    - Available to all components via useCategoryFilter()        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. SIDEBAR RECEIVES DATA                                         │
│    CategorySidebar gets:                                        │
│    - categories[]                                               │
│    - subcategories[]                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. BUILD HIERARCHY                                               │
│    Map categories to find matching subcategories:               │
│                                                                  │
│    const categoriesWithSubs = categories.map(cat => {           │
│      subcategories.filter(sub => sub.category == cat.name)      │
│    })                                                            │
│                                                                  │
│    Parse names to build tree:                                  │
│    "IP Camera" → Level 1                                        │
│    "IP Camera - Camera" → Level 2                               │
│    "IP Camera - Camera - 2 MP" → Level 3                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. RENDER TREE STRUCTURE                                         │
│                                                                  │
│    ├─ [+] CCTV Camera (expandable)                              │
│    │  ├─ [ ] IP Camera                                          │
│    │  │  ├─ [ ] Camera                                          │
│    │  │  │  ├─ [ ] 2 MP IP Camera                               │
│    │  │  │  ├─ [ ] 4 MP IP Camera                               │
│    │  │  │  └─ [ ] 6 MP IP Camera                               │
│    │  │  ├─ [ ] NVR                                             │
│    │  │  │  ├─ [ ] 4 CH                                         │
│    │  │  │  ├─ [ ] 8 CH                                         │
│    │  │  │  ├─ [ ] 16 CH                                        │
│    │  │  │  └─ [ ] 22 CH                                        │
│    │  │  └─ [ ] POE                                             │
│    │  │     ├─ [ ] 4 CH                                         │
│    │  │     ├─ [ ] 8 CH                                         │
│    │  │     └─ [ ] 16 CH                                        │
│    │  ├─ [ ] HD Camera                                          │
│    │  ├─ [ ] Wi-Fi/4G Camera                                    │
│    │  └─ [ ] CCTV Bundle Pack                                   │
│    ├─ [+] Biometric Devices                                     │
│    ├─ [+] Intercom System                                       │
│    ├─ [+] Home & Office Security                                │
│    └─ [+] Fire Alarm Systems                                    │
│                                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. USER INTERACTION                                              │
│    - Click checkbox → selection state updates                   │
│    - Click expand → category expands/collapses                  │
│    - onCategorySelect callback triggered                        │
│    - Filters products based on selection                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Database to Frontend Mapping

```
┌─────────────────────────────────────────────────────────────────┐
│                    MongoDB Documents                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Category: "CCTV Camera"                                         │
│           │                                                       │
│           ├─ Subcategory: "IP Camera"                           │
│           │              │                                       │
│           │              ├─ Subcategory: "IP Camera - Camera"   │
│           │              │              │                        │
│           │              │              ├─ "IP Camera - Camera - 2 MP IP Camera"
│           │              │              ├─ "IP Camera - Camera - 4 MP IP Camera"
│           │              │              └─ "IP Camera - Camera - 6 MP IP Camera"
│           │              │                                       │
│           │              ├─ Subcategory: "IP Camera - NVR"     │
│           │              │              │                        │
│           │              │              ├─ "IP Camera - NVR - 4 CH"
│           │              │              ├─ "IP Camera - NVR - 8 CH"
│           │              │              ├─ "IP Camera - NVR - 16 CH"
│           │              │              └─ "IP Camera - NVR - 22 CH"
│           │              │                                       │
│           │              └─ Subcategory: "IP Camera - POE"     │
│           │                             │                        │
│           │                             ├─ "IP Camera - POE - 4 CH"
│           │                             ├─ "IP Camera - POE - 8 CH"
│           │                             └─ "IP Camera - POE - 16 CH"
│           │                                                       │
│           ├─ Subcategory: "HD Camera"                           │
│           │              └─ [similar structure]                 │
│           │                                                       │
│           ├─ Subcategory: "Wi-Fi/4G Camera"                     │
│           └─ Subcategory: "CCTV Bundle Pack"                    │
│                                                                   │
│  [Same structure for other 4 main categories]                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ API Serialization
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Frontend JavaScript Objects                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  {                                                               │
│    id: "...",                                                    │
│    name: "CCTV Camera",                                          │
│    subcategories: [                                              │
│      {                                                            │
│        id: "...",                                                │
│        name: "IP Camera",                                        │
│        children: [                                               │
│          {                                                        │
│            id: "...",                                            │
│            name: "Camera",                                       │
│            children: [                                           │
│              { id: "...", name: "2 MP IP Camera" },              │
│              { id: "...", name: "4 MP IP Camera" },              │
│              { id: "...", name: "6 MP IP Camera" }               │
│            ]                                                      │
│          },                                                       │
│          {                                                        │
│            id: "...",                                            │
│            name: "NVR",                                          │
│            children: [                                           │
│              { id: "...", name: "4 CH" },                        │
│              { id: "...", name: "8 CH" },                        │
│              { id: "...", name: "16 CH" },                       │
│              { id: "...", name: "22 CH" }                        │
│            ]                                                      │
│          },                                                       │
│          [...]                                                    │
│        ]                                                          │
│      },                                                           │
│      [...]                                                        │
│    ]                                                              │
│  }                                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Naming Convention System

The system uses a clever naming convention to maintain hierarchy:

```
Level 1 (Top-level subcategory):
  "IP Camera"

Level 2 (Child of Level 1):
  "IP Camera" + " - " + "Camera" = "IP Camera - Camera"

Level 3 (Child of Level 2):
  "IP Camera - Camera" + " - " + "2 MP IP Camera" = "IP Camera - Camera - 2 MP IP Camera"

Parsing on Frontend:
  "IP Camera - Camera - 2 MP IP Camera".split(" - ")
  // Returns: ["IP Camera", "Camera", "2 MP IP Camera"]
  
  Parts:
  - parts[0] = Parent Level 1 name
  - parts[1] = Parent Level 2 name
  - parts[2] = Item name
```

This allows the frontend to dynamically build the hierarchy without extra database fields!

---

## 📊 Component Hierarchy

```
App
├── CategoryFilterProvider (Context)
│   │
│   ├── ServicesPage
│   │   └── CategorySidebar
│   │       ├── Categories List
│   │       │   ├── Category Header (Clickable)
│   │       │   └── Subcategories (Hidden until expanded)
│   │       │       ├── Subcategory Item
│   │       │       │   ├── Checkbox
│   │       │       │   ├── Label
│   │       │       │   └── Children (if exists)
│   │       │       │       ├── Child Item
│   │       │       │       │   ├── Checkbox
│   │       │       │       │   └── Label
│   │       │       │       └── Child Item ...
│   │       │       └── Subcategory Item ...
│   │       │
│   │       ├── Price Range Filter
│   │       ├── Brand Filter
│   │       ├── Resolution Filter
│   │       └── Other Filters
│   │
│   └── Other Pages using Categories
│       └── CategorySidebar ...
```

---

## ✨ Summary

The new category system uses a simple but powerful approach:
- **Database**: Flat structure with hierarchical naming
- **Frontend**: Parses names to build dynamic tree structure
- **UX**: Multi-level expandable categories with proper styling
- **Scalability**: Easy to add more items or levels
- **Admin**: Can manage complex category structures easily
