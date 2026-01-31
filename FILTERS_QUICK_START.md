# Quick Start Guide - Dynamic Categories, Subcategories & Filters

## What's New? ✨

Admin can now fully manage:
- ✅ **Categories** - Create, edit, delete product categories
- ✅ **Subcategories** - Create, edit, delete subcategories under categories
- ✅ **Filters** - Create, edit, delete filters (brands, resolutions, etc.)

**All changes are immediately visible to users without restarting the app!**

---

## Step-by-Step Setup

### 1️⃣ Start Backend Server
```bash
cd server
npm start
```
Server will run on: `http://localhost:5000`

### 2️⃣ Start Frontend App
```bash
cd client
npm start
```
App will run on: `http://localhost:3000`

### 3️⃣ Login to Admin Panel
1. Go to `http://localhost:3000/signin`
2. Enter admin credentials
3. Click "Sign In"

### 4️⃣ Access Filter Management
**Option A:** Click "Filters" in sidebar menu
**Option B:** Go directly to `http://localhost:3000/admin/filters`

---

## Managing Categories

### Create a Category
1. Go to `/admin/categories` (or click "Categories" in sidebar)
2. Click "Add New Category"
3. Enter:
   - Category Name (required)
   - Description (optional)
4. Click "Create Category"

### Edit a Category
1. Click ✏️ (edit icon) next to category
2. Modify name/description
3. Click "Update Category"

### Delete a Category
1. Click 🗑️ (delete icon) next to category
2. Confirm deletion

---

## Managing Subcategories

### Create a Subcategory
1. Go to `/admin/subcategories`
2. Click "Add New Subcategory"
3. Enter:
   - Subcategory Name (required)
   - Select Parent Category (required)
   - Description (optional)
4. Click "Create Subcategory"

### Edit a Subcategory
1. Click ✏️ (edit icon) next to subcategory
2. Modify details
3. Click "Update Subcategory"

### Delete a Subcategory
1. Click 🗑️ (delete icon)
2. Confirm deletion

---

## Managing Filters

### Create a Filter

**Example 1: Camera Brands**
1. Go to `/admin/filters`
2. Click "Add New Filter"
3. Fill the form:
   - **Filter Name:** Camera Brands
   - **Filter Type:** brand
   - **Display Order:** 1
   - **Filter Options:**
     - Add: Label = "HIKVISION", Value = "hikvision"
     - Add: Label = "DAHUA", Value = "dahua"
     - Add: Label = "UNIVIEW", Value = "uniview"
4. Click "Create Filter"

**Example 2: Camera Resolutions**
1. Click "Add New Filter"
2. Fill the form:
   - **Filter Name:** IP Camera Resolutions
   - **Filter Type:** resolution
   - **Display Order:** 2
   - **Filter Options:**
     - Add: Label = "2 MP IP Camera", Value = "2mp"
     - Add: Label = "4 MP IP Camera", Value = "4mp"
     - Add: Label = "6 MP IP Camera", Value = "6mp"
3. Click "Create Filter"

**Example 3: NVR Channels**
1. Click "Add New Filter"
2. Fill the form:
   - **Filter Name:** NVR Channels
   - **Filter Type:** channels
   - **Display Order:** 3
   - **Filter Options:**
     - Add: Label = "4 Channel", Value = "4ch"
     - Add: Label = "8 Channel", Value = "8ch"
     - Add: Label = "16 Channel", Value = "16ch"
3. Click "Create Filter"

### Edit a Filter
1. Click ✏️ (edit icon) next to filter
2. Modify:
   - Filter name
   - Options (add/remove)
   - Display order
   - Description
3. Click "Update Filter"

### Delete a Filter
1. Click 🗑️ (delete icon)
2. Confirm deletion

### Add Options to Existing Filter
1. Click ✏️ to edit filter
2. In "Filter Options" section:
   - Click "Add Option" to add new option
   - Click 🗑️ next to option to remove it
3. Click "Update Filter"

---

## How Users See the Changes

### Frontend - Categories & Filters Sidebar
When users visit:
- `/products` - Services/Products page
- `/services` - Services page
- `/about` - About page

They see a sidebar with:
- **Categories Section** - All dynamic categories with subcategories
- **Price Range** - Standard price filters
- **Brands** - Dynamic brands filter (if created)
- **Resolutions** - Dynamic resolution filter (if created)
- **NVR Channels** - Dynamic channels filter (if created)
- **Other Filters** - Any custom filters you create

### Real-Time Updates
✨ **The sidebar automatically shows:**
- ✅ New categories/subcategories added
- ✅ New filters created
- ✅ Deleted categories/filters removed
- ✅ Updated filter options

**Users see changes without page refresh!**

---

## Filter Types Guide

| Type | Use Case | Example |
|------|----------|---------|
| **brand** | Product brands | HIKVISION, DAHUA, AXIS |
| **resolution** | Camera resolution | 2MP, 4MP, 6MP |
| **channels** | NVR channel count | 4ch, 8ch, 16ch |
| **priceRange** | Price ranges | ₹0-5000, ₹5000-10000 |
| **other** | Custom filters | Color, Size, etc. |

---

## Important Tips 💡

1. **Filter Name** must be unique
2. **Filter Options** require both Label and Value
   - Label: What users see (e.g., "2 MP Camera")
   - Value: Internal identifier (e.g., "2mp")
3. **Display Order** controls sidebar order (0, 1, 2, etc.)
4. **Min 1 Option Required** - Each filter needs at least one option
5. **Parent Category Required** - When creating subcategory, select parent category

---

## Verification Checklist

After creating filters, verify:

✅ Go to `/products` or `/services`
✅ Open Categories & Filters sidebar (left panel)
✅ Scroll down to see your new filters
✅ Click filter checkbox to select options
✅ Filter works and shows/hides products
✅ Go back to admin and modify filter
✅ Refresh user page - changes are there!

---

## Troubleshooting

### Filters not showing in sidebar?
- [ ] Created at least one filter with options?
- [ ] Filter status is "Active"?
- [ ] Refresh the page (Ctrl+F5)
- [ ] Check browser console for errors

### Cannot create filter?
- [ ] Filled in all required fields?
- [ ] Added at least one option?
- [ ] Filter name is unique?
- [ ] Logged in as admin?

### Changes not visible to users?
- [ ] Filters are marked as "Active"?
- [ ] Filter has options?
- [ ] User page is refreshed?
- [ ] Check network tab in dev tools

---

## API Endpoints (For Developers)

```bash
# Get all filters
curl http://localhost:5000/api/filters

# Get filters by type
curl http://localhost:5000/api/filters/brand

# Create filter (requires auth + admin)
curl -X POST http://localhost:5000/api/filters \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Brands","type":"brand","options":[...]}'

# Update filter
curl -X PUT http://localhost:5000/api/filters/FILTER_ID \
  -H "Authorization: Bearer TOKEN" \
  -d {...}

# Delete filter
curl -X DELETE http://localhost:5000/api/filters/FILTER_ID \
  -H "Authorization: Bearer TOKEN"
```

---

## Features Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Create Categories | ✅ Working | Add any category |
| Edit Categories | ✅ Working | Modify existing |
| Delete Categories | ✅ Working | With confirmation |
| Create Subcategories | ✅ Working | Under categories |
| Edit Subcategories | ✅ Working | Modify existing |
| Delete Subcategories | ✅ Working | With confirmation |
| Create Filters | ✅ Working | With options |
| Edit Filters | ✅ Working | Modify name/options |
| Delete Filters | ✅ Working | With confirmation |
| Real-time Updates | ✅ Working | No restart needed |
| Admin Auth Required | ✅ Working | Secure operations |
| Fallback Data | ✅ Working | Shows defaults if API fails |
| Responsive Design | ✅ Working | Mobile & desktop |

---

## What's Next?

After setting up, you can:
1. Create sample categories and subcategories
2. Create sample filters with options
3. Test with user account - see filters in sidebar
4. Edit filters and verify changes appear
5. Delete filters and verify removal
6. Add more product categories
7. Customize filter options as needed

---

## Questions or Issues?

Refer to detailed documentation: `DYNAMIC_FILTERS_IMPLEMENTATION.md`

For support:
1. Check admin panel error messages
2. Review browser console logs
3. Check server logs for API errors
4. Verify authentication tokens in browser storage

---

**Status:** ✅ Ready to Use
**Last Updated:** January 31, 2026
