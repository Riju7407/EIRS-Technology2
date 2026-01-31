# Important: Subcategory Relationship Setup

## Issue
The current implementation assumes subcategories have either a `categoryId` or `categoryName` field that links them to their parent category. This document explains how to ensure this relationship is properly configured.

## Solution

### Step 1: Update Subcategory Schema

Make sure your `server/model/subcategorySchema.js` includes a category reference:

```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

const subcategorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Subcategory name is required'],
        trim: true,
        unique: true
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    categoryName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subcategory', subcategorySchema);
```

### Step 2: Update Create Subcategory API

When creating a subcategory, ensure both `categoryId` and `categoryName` are saved:

```javascript
// In server/controller/categoryController.js
exports.createSubcategory = async (req, res) => {
  try {
    const { name, categoryId, description } = req.body;

    // Fetch category to get name
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const newSubcategory = new Subcategory({
      name,
      categoryId,
      categoryName: category.name,
      description
    });

    const savedSubcategory = await newSubcategory.save();
    
    res.status(201).json({
      success: true,
      data: savedSubcategory,
      message: 'Subcategory created successfully'
    });
  } catch (error) {
    // ... error handling
  }
};
```

### Step 3: Update CategorySidebar Component

The CategorySidebar is already updated to handle both scenarios:

```javascript
// Already handles both cases:
subcategories
  .filter(sub => sub.categoryId === category._id || sub.categoryName === category.name)
  .map(sub => ({
    id: sub._id,
    name: sub.name
  }))
```

### Step 4: Verify Existing Subcategories

If you have existing subcategories in the database without `categoryId`, you have two options:

**Option A: Migrate existing data**
```javascript
// Run this in your terminal
db.subcategories.updateMany(
  { categoryId: { $exists: false } },
  [
    {
      $lookup: {
        from: "categories",
        localField: "categoryName",
        foreignField: "name",
        as: "matchedCategory"
      }
    },
    {
      $set: {
        categoryId: { $arrayElemAt: ["$matchedCategory._id", 0] }
      }
    },
    {
      $project: { matchedCategory: 0 }
    }
  ]
)
```

**Option B: Delete and recreate**
1. Delete all subcategories from database
2. Use admin panel to recreate them (ensures proper structure)

---

## Verification

After setup, verify the relationship works:

### Check in MongoDB
```javascript
// Check a subcategory has both fields
db.subcategories.findOne({
  name: "Your Subcategory Name"
})

// Should return:
{
  _id: ObjectId(...),
  name: "Your Subcategory Name",
  categoryId: ObjectId(...),  // ← This should exist
  categoryName: "Category Name",
  description: "...",
  isActive: true,
  createdAt: ISODate(...),
  updatedAt: ISODate(...)
}
```

### Test in Admin Panel
1. Go to `/admin/subcategories`
2. When adding new subcategory:
   - Should show category dropdown ✓
   - Should save `categoryId` ✓
   - Should save `categoryName` ✓

### Test in User View
1. Go to `/products` or `/services`
2. Open Categories & Filters sidebar
3. Categories should expand showing subcategories ✓

---

## If You Encounter Issues

### Subcategories not showing under categories?

**Check 1:** Verify `categoryId` field exists
```bash
db.subcategories.findOne({})
# Look for "categoryId" field in response
```

**Check 2:** Verify `categoryId` matches actual category
```bash
db.categories.findOne({ _id: ObjectId("paste_id_here") })
# Should return the category
```

**Check 3:** Check CategorySidebar filtering logic
- Ensure the category._id matches subcategory.categoryId
- Or categoryName matches

### Filter endpoints?

If you face issues with filtering, the CategorySidebar component has fallback hardcoded categories that will display even if the database query fails. This ensures the app doesn't break.

---

## Quick Setup Checklist

- [ ] Subcategory schema has `categoryId` field
- [ ] Subcategory schema has `categoryName` field
- [ ] Create subcategory API saves both fields
- [ ] Update subcategory API preserves both fields
- [ ] Admin can create subcategory with category selection
- [ ] Subcategories display under parent categories in sidebar
- [ ] Existing subcategories migrated or recreated
- [ ] Test with real data to verify

---

## Important Notes

1. **Required Fields:** Both `categoryId` and `categoryName` should be present
2. **On Delete:** If category is deleted, consider handling orphaned subcategories
3. **On Update:** If category name changes, update all related subcategories
4. **Fallback:** App has hardcoded backup if database data is missing

---

## Example Data Structure

### Category
```json
{
  "_id": "ObjectId()",
  "name": "CCTV Cameras",
  "description": "Camera systems",
  "isActive": true
}
```

### Subcategory (Correct Structure)
```json
{
  "_id": "ObjectId()",
  "name": "IP Camera Solutions",
  "categoryId": "ObjectId()",        // ← Links to Category._id
  "categoryName": "CCTV Cameras",    // ← Denormalized copy
  "description": "IP based cameras",
  "isActive": true
}
```

---

## Support

If you need to fix the relationship structure:

1. Check current subcategories with `db.subcategories.find({})`
2. See which ones are missing `categoryId`
3. Use the migration script above, or
4. Delete and recreate via admin panel

---

**Status:** Important Setup Information
**Required For:** Proper category-subcategory relationships
**Last Updated:** January 31, 2026
