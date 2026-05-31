# Admin Category & Subcategory Management Guide

## Overview
The Admin Panel in EIRS 2 includes a complete category and subcategory management system. This guide will help you manage product categories and their subcategories efficiently.

---

## 📋 Table of Contents
1. [Accessing the Category Management Page](#accessing-the-category-management-page)
2. [Managing Categories](#managing-categories)
3. [Managing Subcategories](#managing-subcategories)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)

---

## Accessing the Category Management Page

### Step 1: Login to Admin Panel
1. Go to your application and click **"Sign In"**
2. Enter your admin credentials (email and password)
3. You will be redirected to the Admin Dashboard

### Step 2: Navigate to Categories
From the **Admin Dashboard**, click on **"📁 Categories"** in the sidebar navigation

**Alternative Navigation:**
- URL: `http://localhost:3000/admin/subcategories` (for local development)
- URL: `https://yourdomain.com/admin/subcategories` (for production)

---

## Managing Categories

### View All Categories
On the Categories & Subcategories page:
1. Click the **"📁 Categories"** tab at the top
2. All existing categories will be displayed in a grid view
3. Each category shows:
   - Category Name
   - Description
   - Edit and Delete buttons

### Add New Category

1. Click the **"➕ Add New Category"** button
2. A form will appear with the following fields:
   - **Category Name** (Required) - e.g., "CCTV Cameras", "Access Control", "Intercom Systems"
   - **Description** (Optional) - Brief description of the category

3. Fill in the details:
   ```
   Example:
   Name: CCTV Cameras
   Description: Video surveillance systems and cameras for security monitoring
   ```

4. Click **"Create Category"** button
5. You'll see a success message confirming the category was created
6. The new category will appear in the categories list

### Edit Existing Category

1. Find the category you want to edit in the categories grid
2. Click the **✏️ Edit** button on the category card
3. The form will populate with the current category details
4. Update the information as needed
5. Click **"Update Category"** button
6. The changes will be saved and the success message will appear

### Delete Category

1. Find the category you want to delete
2. Click the **🗑️ Delete** button on the category card
3. A confirmation dialog will appear asking: "Are you sure you want to delete [Category Name]?"
4. Click **"OK"** to confirm deletion

**Important Notes:**
- ⚠️ A category cannot be deleted if it has subcategories
- You must delete all subcategories first before deleting the parent category
- Deleted categories are soft-deleted (marked as inactive, not permanently removed from database)

---

## Managing Subcategories

### View All Subcategories
On the Categories & Subcategories page:
1. Click the **"🏷️ Subcategories"** tab at the top
2. All existing subcategories will be displayed in a table format
3. Each subcategory shows:
   - Subcategory Name
   - Parent Category
   - Description
   - Created Date
   - Edit and Delete buttons

### Add New Subcategory

**Prerequisites:**
- At least one category must exist before creating subcategories
- If no categories exist, you'll see a message: "Please add categories first before adding subcategories"

**Steps:**
1. Click the **"➕ Add New Subcategory"** button
2. A form will appear with the following fields:
   - **Category** (Required) - Dropdown to select parent category
   - **Subcategory Name** (Required) - e.g., "Dome Cameras", "Bullet Cameras"
   - **Description** (Optional) - Brief description of the subcategory

3. Fill in the details:
   ```
   Example:
   Category: CCTV Cameras
   Subcategory Name: Dome Cameras
   Description: Professional dome-type CCTV cameras for indoor surveillance
   ```

4. Click **"Create Subcategory"** button
5. Success message will confirm creation
6. The new subcategory will appear in the subcategories table

### Edit Existing Subcategory

1. Find the subcategory in the table
2. Click the **✏️ Edit** button in the Actions column
3. The form will populate with current details
4. Update the information:
   - You can change the parent category
   - Update the name and description
5. Click **"Update Subcategory"** button
6. Changes will be saved and confirmed

### Delete Subcategory

1. Find the subcategory in the table
2. Click the **🗑️ Delete** button in the Actions column
3. A confirmation dialog will appear
4. Click **"OK"** to confirm deletion

**Note:**
- Subcategories are soft-deleted and marked as inactive
- Deleting a subcategory will remove it from the parent category's list

---

## Best Practices

### Naming Conventions
- ✅ Use clear, descriptive names
- ✅ Use Title Case (e.g., "CCTV Cameras", "Dome Cameras")
- ✅ Be specific and consistent
- ❌ Avoid abbreviations or unclear names
- ❌ Don't use special characters

### Examples of Good Category Structure:

```
📁 Security Systems
   🏷️ CCTV Cameras
   🏷️ Access Control
   🏷️ Alarm Systems

📁 Communication Systems
   🏷️ Intercom Systems
   🏷️ Video Phones
   🏷️ Door Phones

📁 Networking
   🏷️ Routers & Switches
   🏷️ Network Cables
   🏷️ POE Injectors
```

### Management Tips
1. **Plan your hierarchy first** - Decide on categories before creating subcategories
2. **Keep it organized** - Limit categories to logical groupings (5-15 per parent)
3. **Use descriptions** - Help users understand what each category contains
4. **Regular maintenance** - Review and update categories periodically
5. **Avoid duplicates** - Check existing categories before creating new ones

---

## Troubleshooting

### Issue: "Category already exists" error
**Solution:**
- A category with the same name (case-insensitive) already exists
- Try a different name or edit the existing category instead

### Issue: "Cannot delete category with X subcategories" error
**Solution:**
- The category has associated subcategories
- Delete all subcategories first
- Then delete the parent category

### Issue: "Please select a category" error when adding subcategory
**Solution:**
- Ensure the category dropdown has a valid selection
- Click the dropdown and select a category
- Make sure at least one category exists

### Issue: Changes not appearing after save
**Solution:**
1. Check that the success message appeared
2. If no message, check for error messages in red
3. Refresh the page (Ctrl+R or Cmd+R)
4. Check browser console for network errors (F12)

### Issue: "Unauthorized" or "401" error
**Solution:**
- Your login session may have expired
- Log out and log back in
- Clear browser cache and cookies
- Try again

---

## API Reference (For Developers)

### Category Endpoints

```
GET /api/categories
- Get all active categories

POST /api/categories
- Create new category
- Required: name
- Optional: description
- Auth: Required (Admin)

PUT /api/categories/:id
- Update category
- Required: name
- Optional: description
- Auth: Required (Admin)

DELETE /api/categories/:id
- Delete category (soft delete)
- Auth: Required (Admin)
```

### Subcategory Endpoints

```
GET /api/subcategories
- Get all active subcategories

POST /api/subcategories
- Create new subcategory
- Required: name, category
- Optional: description
- Auth: Required (Admin)

PUT /api/subcategories/:id
- Update subcategory
- Required: name, category
- Optional: description
- Auth: Required (Admin)

DELETE /api/subcategories/:id
- Delete subcategory (soft delete)
- Auth: Required (Admin)
```

---

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review error messages displayed on the page
3. Check browser console (F12 → Console tab)
4. Contact your development team with error details

---

**Last Updated:** January 31, 2026
**Version:** 1.0
