# 🏗️ Admin Category Management - System Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE (React)                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │           AdminSubcategories Component                           │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │ 📊 Admin Dashboard                                         │ │  │
│  │  │ ┌──────────────────────────────────────────────────────┐  │ │  │
│  │  │ │ Sidebar Navigation                                   │  │ │  │
│  │  │ │ ├─ Dashboard                                         │  │ │  │
│  │  │ │ ├─ Users                                             │  │ │  │
│  │  │ │ ├─ Enquiries                                         │  │ │  │
│  │  │ │ ├─ Products                                          │  │ │  │
│  │  │ │ ├─ 📁 Categories ⭐ (SELECTED)                        │  │ │  │
│  │  │ │ ├─ Services                                          │  │ │  │
│  │  │ │ └─ Orders                                            │  │ │  │
│  │  │ └──────────────────────────────────────────────────────┘  │ │  │
│  │  │ ┌──────────────────────────────────────────────────────┐  │ │  │
│  │  │ │ Tab Navigation                                       │  │ │  │
│  │  │ │ [📁 Categories] [🏷️ Subcategories]                   │  │ │  │
│  │  │ └──────────────────────────────────────────────────────┘  │ │  │
│  │  │ ┌────────────── 📁 CATEGORIES TAB ──────────────────────┐ │ │  │
│  │  │ │ [➕ Add New Category]                                 │ │ │  │
│  │  │ │                                                       │ │ │  │
│  │  │ │ ┌───────────────────────┐  ┌───────────────────────┐ │ │ │  │
│  │  │ │ │ Category Card 1       │  │ Category Card 2       │ │ │ │  │
│  │  │ │ │ ┌────────────────────┐│  │ ┌────────────────────┐│ │ │ │  │
│  │  │ │ │ │ CCTV Cameras  ✏️ 🗑️││  │ │ Access Control ✏️ 🗑️││ │ │ │  │
│  │  │ │ │ ├────────────────────┤│  │ ├────────────────────┤│ │ │ │  │
│  │  │ │ │ │ Description:       ││  │ │ Description:       ││ │ │ │  │
│  │  │ │ │ │ Professional       ││  │ │ Advanced access... ││ │ │ │  │
│  │  │ │ │ │ surveillance       ││  │ │ solutions...       ││ │ │ │  │
│  │  │ │ │ │ systems            ││  │ │                    ││ │ │ │  │
│  │  │ │ │ └────────────────────┘│  │ └────────────────────┘│ │ │ │  │
│  │  │ │ └───────────────────────┘  └───────────────────────┘ │ │ │  │
│  │  │ └──────────────────────────────────────────────────────┘ │ │  │
│  │  │ ┌────────────── 🏷️ SUBCATEGORIES TAB ──────────────────┐ │ │  │
│  │  │ │ [➕ Add New Subcategory]                              │ │ │  │
│  │  │ │                                                       │ │ │  │
│  │  │ │ ┌─ TABLE ──────────────────────────────────────────┐ │ │ │  │
│  │  │ │ │Name    │Category    │Description  │Date │Actions│ │ │ │  │
│  │  │ │ ├────────┼────────────┼─────────────┼─────┼───────┤ │ │ │  │
│  │  │ │ │Dome    │CCTV Cams   │Indoor dome..│Jan20│✏️ 🗑️ │ │ │ │  │
│  │  │ │ │Bullet  │CCTV Cams   │Outdoor...  │Jan19│✏️ 🗑️ │ │ │ │  │
│  │  │ │ │PTZ     │CCTV Cams   │Pan-tilt-z..│Jan18│✏️ 🗑️ │ │ │ │  │
│  │  │ │ └────────┴────────────┴─────────────┴─────┴───────┘ │ │ │  │
│  │  │ └──────────────────────────────────────────────────────┘ │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
                          HTTP/REST API Calls
                          (Axios Library)
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER (Node.js)                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Routes: /api/categories, /api/subcategories                      │  │
│  │ Router: categoryRouter.js                                        │  │
│  │                                                                   │  │
│  │ ┌────────────────────────────────────────────────────────────┐  │  │
│  │ │ Middleware Stack:                                          │  │  │
│  │ │ 1. verifyToken (JWT Authentication)                        │  │  │
│  │ │ 2. verifyAdmin (Admin Role Check)                          │  │  │
│  │ │ 3. Request Handler (Controller)                            │  │  │
│  │ └────────────────────────────────────────────────────────────┘  │  │
│  │                                                                   │  │
│  │ ┌────────────────────────────────────────────────────────────┐  │  │
│  │ │ Controller: categoryController.js                           │  │  │
│  │ │ ├─ getAllCategories()                                      │  │  │
│  │ │ ├─ createCategory()                                        │  │  │
│  │ │ ├─ updateCategory()                                        │  │  │
│  │ │ ├─ deleteCategory()                                        │  │  │
│  │ │ ├─ getAllSubcategories()                                   │  │  │
│  │ │ ├─ createSubcategory()                                     │  │  │
│  │ │ ├─ updateSubcategory()                                     │  │  │
│  │ │ └─ deleteSubcategory()                                     │  │  │
│  │ └────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
                        MongoDB Database Driver
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                       MONGODB DATABASE                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Collections:                                                      │  │
│  │                                                                   │  │
│  │ 📦 categories                                                     │  │
│  │ ├─ _id: ObjectId                                                │  │
│  │ ├─ name: String (unique)                                        │  │
│  │ ├─ description: String                                          │  │
│  │ ├─ subcategories: [String]                                      │  │
│  │ ├─ isActive: Boolean                                            │  │
│  │ ├─ createdAt: Date                                              │  │
│  │ └─ updatedAt: Date                                              │  │
│  │                                                                   │  │
│  │ 📦 subcategories                                                │  │
│  │ ├─ _id: ObjectId                                                │  │
│  │ ├─ name: String (unique per category)                           │  │
│  │ ├─ category: ObjectId (ref: categories)                         │  │
│  │ ├─ description: String                                          │  │
│  │ ├─ icon: String                                                 │  │
│  │ ├─ createdAt: Date                                              │  │
│  │ └─ updatedAt: Date                                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Adding a Category

```
Admin fills form
    │
    ├─ Category Name (required)
    └─ Description (optional)
    │
    ↓
Validates input (client-side)
    │
    ├─ Name not empty?
    └─ No duplicates?
    │
    ↓
POST /api/categories
    │
    ├─ Headers: Authorization: Bearer {token}
    └─ Body: { name, description }
    │
    ↓
Server Middleware
    │
    ├─ verifyToken() → Check JWT
    └─ verifyAdmin() → Check role
    │
    ↓
categoryController.createCategory()
    │
    ├─ Validate input again (server-side)
    ├─ Check for duplicates in DB
    ├─ Create new Document
    ├─ Save to MongoDB
    └─ Return response
    │
    ↓
Frontend receives response
    │
    ├─ Success: Show success message
    ├─ Refresh data
    └─ Clear form
    │
    ↓
UI Updates
    │
    └─ New category appears in list ✅
```

### Editing a Category

```
Admin clicks Edit button
    │
    ↓
Form populates with current data
    │
    ├─ Category ID
    ├─ Current Name
    └─ Current Description
    │
    ↓
Admin makes changes
    │
    ├─ Name
    └─ Description
    │
    ↓
Click "Update Category"
    │
    ↓
PUT /api/categories/:id
    │
    ├─ Headers: Authorization: Bearer {token}
    └─ Body: { name, description }
    │
    ↓
Server processes update
    │
    ├─ Verify admin
    ├─ Check for duplicates (excluding current)
    ├─ Update MongoDB document
    └─ Return updated data
    │
    ↓
Frontend updates UI
    │
    └─ Changes reflected immediately ✅
```

### Deleting a Category

```
Admin clicks Delete button
    │
    ↓
Confirmation dialog appears
    │
    "Are you sure you want to delete [Category]?"
    │
    ├─ Cancel → Form closes
    └─ OK → Continue
    │
    ↓
DELETE /api/categories/:id
    │
    ├─ Headers: Authorization: Bearer {token}
    └─ URL: /api/categories/{categoryId}
    │
    ↓
Server validation
    │
    ├─ Verify admin
    ├─ Check for subcategories
    │  ├─ If has subcategories → Error (delete subs first)
    │  └─ If no subcategories → Continue
    └─ Mark as isActive: false (soft delete)
    │
    ↓
Frontend handles response
    │
    ├─ Error: Show error message
    └─ Success: Refresh list, show success message
    │
    ↓
UI Updates
    │
    └─ Category removed from view ✅
```

---

## API Request/Response Flow

### GET Categories
```
REQUEST:
  GET /api/categories
  Headers: None required (public endpoint)

RESPONSE:
  200 OK
  {
    "success": true,
    "data": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "CCTV Cameras",
        "description": "Professional surveillance systems",
        "subcategories": ["Dome Cameras", "Bullet Cameras"],
        "isActive": true,
        "createdAt": "2024-01-20T10:30:00Z",
        "updatedAt": "2024-01-20T10:30:00Z"
      }
    ]
  }
```

### POST Category
```
REQUEST:
  POST /api/categories
  Headers: 
    Authorization: Bearer {jwt_token}
    Content-Type: application/json
  Body:
  {
    "name": "CCTV Cameras",
    "description": "Professional surveillance systems"
  }

RESPONSE (Success):
  201 Created
  {
    "success": true,
    "message": "Category created successfully",
    "data": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "CCTV Cameras",
      "description": "Professional surveillance systems",
      "subcategories": [],
      "isActive": true,
      "createdAt": "2024-01-20T10:30:00Z",
      "updatedAt": "2024-01-20T10:30:00Z"
    }
  }

RESPONSE (Error - Duplicate):
  400 Bad Request
  {
    "success": false,
    "message": "Category already exists"
  }

RESPONSE (Error - Unauthorized):
  401 Unauthorized
  {
    "success": false,
    "message": "Unauthorized"
  }
```

### PUT Category
```
REQUEST:
  PUT /api/categories/507f1f77bcf86cd799439011
  Headers:
    Authorization: Bearer {jwt_token}
  Body:
  {
    "name": "CCTV Cameras - Updated",
    "description": "Updated description"
  }

RESPONSE (Success):
  200 OK
  {
    "success": true,
    "message": "Category updated successfully",
    "data": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "CCTV Cameras - Updated",
      "description": "Updated description",
      ...
    }
  }
```

### DELETE Category
```
REQUEST:
  DELETE /api/categories/507f1f77bcf86cd799439011
  Headers:
    Authorization: Bearer {jwt_token}

RESPONSE (Success):
  200 OK
  {
    "success": true,
    "message": "Category deleted successfully",
    "data": {
      "_id": "507f1f77bcf86cd799439011",
      "isActive": false,
      ...
    }
  }

RESPONSE (Error - Has Subcategories):
  400 Bad Request
  {
    "success": false,
    "message": "Cannot delete category with 3 subcategories. Delete subcategories first."
  }
```

---

## Component State Management

```
AdminSubcategories Component
├─ State Variables:
│  ├─ categories: [] (loaded from API)
│  ├─ subcategories: [] (loaded from API)
│  ├─ loading: false (during API calls)
│  ├─ showForm: false (show/hide form)
│  ├─ activeTab: 'categories' (which tab is showing)
│  ├─ editingId: null (which item is being edited)
│  ├─ editingCategoryId: null (which category is being edited)
│  ├─ error: '' (error message)
│  ├─ success: '' (success message)
│  ├─ categoryFormData: { name: '', description: '' }
│  └─ subcategoryFormData: { name: '', category: '', description: '' }
│
├─ Effects:
│  └─ useEffect(() => fetchData(), [])
│     └─ Runs on component mount
│     └─ Fetches categories and subcategories
│
├─ Event Handlers:
│  ├─ handleAddCategory()
│  ├─ handleEditCategory(category)
│  ├─ handleDeleteCategory(id, name)
│  ├─ handleSaveCategory(e)
│  ├─ handleAddSubcategory()
│  ├─ handleEditSubcategory(subcategory)
│  ├─ handleDeleteSubcategory(id, name)
│  └─ handleSaveSubcategory(e)
│
└─ Rendered Elements:
   ├─ Sidebar (navigation)
   ├─ Top bar (profile, logout)
   ├─ Tab navigation (categories | subcategories)
   ├─ Forms (add/edit)
   ├─ Data displays (grids/tables)
   ├─ Alert messages
   └─ Buttons (add, edit, delete)
```

---

## Authentication & Authorization Flow

```
User Login
    │
    ├─ Email & Password
    │
    ↓
POST /auth/login
    │
    ├─ Verify credentials in DB
    ├─ Generate JWT token
    └─ Return token
    │
    ↓
Frontend stores token in localStorage
    │
    localStorage.setItem('token', jwt_token)
    │
    ↓
Admin navigates to Categories
    │
    ├─ ProtectedAdminRoute component checks:
    │  ├─ Is token present?
    │  ├─ Is user admin?
    │  └─ Is token valid?
    │
    ├─ If all valid → Show AdminSubcategories
    └─ If invalid → Redirect to /signin
    │
    ↓
API requests include token
    │
    ├─ POST /api/categories
    │  Headers: Authorization: Bearer {token}
    │
    ↓
Server middleware validates
    │
    ├─ verifyToken() → Checks JWT signature and expiry
    ├─ verifyAdmin() → Checks isAdmin flag in user object
    │
    ├─ If valid → Process request
    └─ If invalid → Return 401/403 error
    │
    ↓
Response sent to frontend
    │
    └─ Update UI accordingly ✅
```

---

## Error Handling Flow

```
Error Occurs
    │
    ├─ Client-side error (form validation)
    │  └─ Show error in UI immediately
    │
    ├─ Network error (API call fails)
    │  ├─ Axios intercepts error
    │  ├─ Extract error message
    │  └─ Display in red alert
    │
    └─ Server-side error (API responds with error)
       ├─ Error code 400 → Bad Request (validation)
       ├─ Error code 401 → Unauthorized (not logged in)
       ├─ Error code 403 → Forbidden (not admin)
       ├─ Error code 404 → Not Found (item deleted)
       └─ Error code 500 → Server Error
    │
    ↓
Frontend displays user-friendly message
    │
    ├─ "Category already exists"
    ├─ "Cannot delete category with subcategories"
    ├─ "Unauthorized"
    └─ "Error saving category"
    │
    ↓
Auto-dismiss after 3 seconds
    │
    └─ User can try again ✅
```

---

## Data Relationship Diagram

```
                    ┌─────────────────────┐
                    │    User (Admin)      │
                    ├─────────────────────┤
                    │ _id                  │
                    │ email                │
                    │ password             │
                    │ isAdmin: true ✅     │
                    │ createdAt            │
                    └────────────┬─────────┘
                                 │
                    (Authenticated via JWT)
                                 │
                ┌────────────────┼────────────────┐
                │                                 │
        ┌───────▼──────────┐          ┌──────────▼──────────┐
        │   Categories     │          │ Subcategories      │
        ├──────────────────┤          ├────────────────────┤
        │ _id              │          │ _id                │
        │ name (unique)    │◄─────────┤ name (per cat)     │
        │ description      │          │ category (ref) ────┼──┐
        │ subcategories[]  │          │ description        │  │
        │ isActive         │          │ icon               │  │
        │ createdAt        │          │ createdAt          │  │
        │ updatedAt        │          │ updatedAt          │  │
        └──────────────────┘          └────────────────────┘  │
                                                              │
        Category: "CCTV Cameras"                              │
        Subcategories: ─────────────────────────────────────┘
            - Dome Cameras
            - Bullet Cameras
            - PTZ Cameras
            - IP Cameras
```

---

## Component Hierarchy

```
App.js
├─ Router
│  └─ Routes
│     ├─ / (HomePage)
│     ├─ /signin (SignInPage)
│     ├─ /admin/dashboard (AdminDashboard)
│     │  └─ Sidebar with links
│     ├─ /admin/users (AdminUsers)
│     ├─ /admin/enquiries (AdminEnquiries)
│     ├─ /admin/products (AdminProducts)
│     ├─ /admin/subcategories (AdminSubcategories) ⭐
│     │  └─ Main component
│     │     ├─ Sidebar (collapsible)
│     │     ├─ Top bar
│     │     ├─ Tab navigation
│     │     │  ├─ Categories Tab
│     │     │  │  ├─ Add form
│     │     │  │  └─ Grid display
│     │     │  └─ Subcategories Tab
│     │     │     ├─ Add form
│     │     │     └─ Table display
│     │     ├─ Alert messages
│     │     └─ Styling (inline)
│     ├─ /admin/services (AdminServices)
│     └─ /admin/orders (AdminOrders)
│
└─ Protected routes with ProtectedAdminRoute component
```

---

**Diagram Version:** 1.0
**Last Updated:** January 31, 2026
