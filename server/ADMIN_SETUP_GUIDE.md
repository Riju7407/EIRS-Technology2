# Admin Panel Navigation Guide

## How to Access Admin Category Management

### From Admin Dashboard
The admin category management pages should be added to your admin navigation. Here's how to integrate them:

### 1. Add Links to AdminDashboard Navigation

Update your admin dashboard or sidebar navigation to include:

```jsx
// Add to your admin navigation menu
<Link to="/admin/categories" className="nav-item">
  <FaTags /> Categories
</Link>

<Link to="/admin/subcategories" className="nav-item">
  <FaTags /> Subcategories
</Link>
```

### 2. Setup Routes in Your Router

Add these routes to your main routing configuration (App.js or Routes.js):

```jsx
import AdminCategories from './pages/AdminCategories';
import AdminSubcategories from './pages/AdminSubcategories';

// In your route configuration:
<Route path="/admin/categories" element={<AdminCategories />} />
<Route path="/admin/subcategories" element={<AdminSubcategories />} />
```

### 3. Direct Access URLs

Once set up, you can access:

- **Categories Management:** `http://localhost:3001/admin/categories`
- **Subcategories Management:** `http://localhost:3001/admin/subcategories`

---

## Features Available

### Categories Management Page

**URL:** `/admin/categories`

**Capabilities:**
- ✅ View all categories in a table
- ✅ Add new category (name + description)
- ✅ Edit existing category
- ✅ Delete category (with confirmation)
- ✅ Real-time validation
- ✅ Success/Error notifications

**Form Fields:**
- Category Name (required)
- Description (optional)

### Subcategories Management Page

**URL:** `/admin/subcategories`

**Capabilities:**
- ✅ View all subcategories in a table
- ✅ Add new subcategory (with category selection)
- ✅ Edit subcategory (change category, name, description)
- ✅ Delete subcategory (with confirmation)
- ✅ Tab-based interface (Categories | Subcategories)
- ✅ Category dropdown for selection

**Form Fields:**
- Category Selection (dropdown, required)
- Subcategory Name (required)
- Description (optional)

---

## Step-by-Step Setup

### Step 1: Update Your Routes

```jsx
// In your App.js or main Routes file
import AdminCategories from './pages/AdminCategories';
import AdminSubcategories from './pages/AdminSubcategories';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... other routes ... */}
        
        {/* Admin Routes */}
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/subcategories" element={<AdminSubcategories />} />
        
        {/* ... more routes ... */}
      </Routes>
    </BrowserRouter>
  );
}
```

### Step 2: Update Admin Navigation

```jsx
// In your AdminDashboard.js or AdminSidebar.js
<nav className="admin-nav">
  <Link to="/admin/dashboard" className="nav-item">
    <FaChartBar /> Dashboard
  </Link>
  
  <Link to="/admin/categories" className="nav-item">
    <FaTags /> Manage Categories
  </Link>
  
  <Link to="/admin/subcategories" className="nav-item">
    <FaTags /> Manage Subcategories
  </Link>
  
  <Link to="/admin/products" className="nav-item">
    <FaBox /> Products
  </Link>
  
  {/* ... other nav items ... */}
</nav>
```

### Step 3: Verify Backend Routes

Make sure your backend server (server.js) has:

```javascript
const categoryRouter = require('./router/categoryRouter.js');
app.use('/api', categoryRouter);
```

---

## API Endpoints Reference

### Category Endpoints

```
GET    /api/categories              - List all categories
POST   /api/categories              - Create category (Admin only)
PUT    /api/categories/:id          - Update category (Admin only)
DELETE /api/categories/:id          - Delete category (Admin only)
```

### Subcategory Endpoints

```
GET    /api/subcategories           - List all subcategories
GET    /api/subcategories?categoryId=ID  - List by category
POST   /api/subcategories           - Create subcategory (Admin only)
PUT    /api/subcategories/:id       - Update subcategory (Admin only)
DELETE /api/subcategories/:id       - Delete subcategory (Admin only)
```

---

## Admin Authentication Requirements

⚠️ **Important:** All management operations require:

1. **Valid JWT Token** - User must be logged in
2. **Admin Role** - User must have `isAdmin: true` in database
3. **Valid Session** - Token must not be expired

### Check Your Admin User

Login with admin credentials:
- **Email:** admin@eirtech.com
- **Password:** Admin@123

If this user doesn't exist, it will be auto-created on server startup.

---

## Usage Workflow

### Creating a Category

1. Navigate to `/admin/categories`
2. Click "+ Add Category" button
3. Fill in category name (required)
4. Add description (optional)
5. Click "Save Category"
6. ✅ Category appears in table

### Creating a Subcategory

1. Navigate to `/admin/subcategories`
2. **Ensure categories exist first!** (Create categories first if needed)
3. Click "+ Add Subcategory" button
4. Select category from dropdown
5. Enter subcategory name
6. Add description (optional)
7. Click "Save Subcategory"
8. ✅ Subcategory appears in table linked to category

### Editing Items

1. Find the item in the table
2. Click "Edit" button
3. Modify details as needed
4. Click "Update" button
5. ✅ Changes saved immediately

### Deleting Items

1. Find the item in the table
2. Click "Delete" button
3. Confirm deletion in popup
4. ✅ Item removed from list

---

## Data Synchronization

When you create/update/delete categories or subcategories:

1. **Categories** are automatically available in:
   - HomePage category filter
   - ProductsPage category dropdown
   - Product creation forms

2. **Subcategories** update:
   - ProductsPage subcategory dropdown
   - Product filtering options
   - Category detail pages

3. **Changes take effect immediately** - No restart needed!

---

## Troubleshooting

### "Cannot add category" error
- ✅ Check JWT token is valid
- ✅ Verify user is admin
- ✅ Ensure category name is not empty
- ✅ Check browser console for error details

### "Subcategory button disabled"
- ✅ This means no categories exist yet
- ✅ Create at least one category first
- ✅ Button will enable automatically

### Categories not showing in dropdowns
- ✅ Refresh the page
- ✅ Check browser network tab for API response
- ✅ Verify categories were created
- ✅ Clear browser cache if needed

### Delete not working
- ✅ Verify user is admin
- ✅ Check if token expired (logout and login again)
- ✅ Category may have subcategories (must delete subcategories first)

---

## Performance Tips

1. **Keep category names short** - Better table display
2. **Use descriptions** - Helps identify categories later
3. **Organize hierarchically** - Parent category → Subcategories
4. **Regular cleanup** - Delete unused categories

---

## Security Reminders

- 🔒 Only admins can manage categories
- 🔒 All changes require valid JWT token
- 🔒 Passwords are hashed and secure
- 🔒 Session expires after inactivity

---

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify API endpoints in network tab
3. Ensure backend is running
4. Check authentication token validity
5. Review error messages in admin UI

---

**Ready to use!** Your admin can now manage all categories and subcategories dynamically! 🎉
