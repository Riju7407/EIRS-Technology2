const Category = require('../model/categorySchema');
const Subcategory = require('../model/subcategorySchema');

// ======================== CATEGORY CONTROLLERS ========================

// GET all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort('name');
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

// CREATE new category
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const existingCategory = await Category.findOne({ 
            name: new RegExp(`^${name.trim()}$`, 'i') 
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists'
            });
        }

        const newCategory = new Category({
            name: name.trim(),
            description: description?.trim() || '',
            subcategories: []
        });

        await newCategory.save();

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: newCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating category',
            error: error.message
        });
    }
};

// UPDATE category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        // Check if another category has the same name
        const existingCategory = await Category.findOne({
            _id: { $ne: id },
            name: new RegExp(`^${name.trim()}$`, 'i')
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category name already exists'
            });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            {
                name: name.trim(),
                description: description?.trim() || ''
            },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating category',
            error: error.message
        });
    }
};

// DELETE category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category has subcategories
        const subcategoriesCount = await Subcategory.countDocuments({ category: id });

        if (subcategoriesCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category with ${subcategoriesCount} subcategories. Delete subcategories first.`
            });
        }

        const deletedCategory = await Category.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
            data: deletedCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: error.message
        });
    }
};

// ======================== SUBCATEGORY CONTROLLERS ========================

// GET all subcategories
exports.getAllSubcategories = async (req, res) => {
    try {
        const { categoryId } = req.query;

        let query = Subcategory.find({ isActive: true });

        if (categoryId) {
            query = query.where('category').equals(categoryId);
        }

        const subcategories = await query.sort('name');

        res.status(200).json({
            success: true,
            data: subcategories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching subcategories',
            error: error.message
        });
    }
};

// CREATE new subcategory
exports.createSubcategory = async (req, res) => {
    try {
        const { name, category, description } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Subcategory name is required'
            });
        }

        if (!category || category.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Category is required'
            });
        }

        const existingSubcategory = await Subcategory.findOne({
            name: new RegExp(`^${name.trim()}$`, 'i'),
            category: category
        });

        if (existingSubcategory) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory already exists in this category'
            });
        }

        const newSubcategory = new Subcategory({
            name: name.trim(),
            category: category,
            description: description?.trim() || ''
        });

        await newSubcategory.save();

        // Update category's subcategories array
        await Category.findByIdAndUpdate(
            category,
            { $push: { subcategories: name.trim() } }
        );

        res.status(201).json({
            success: true,
            message: 'Subcategory created successfully',
            data: newSubcategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating subcategory',
            error: error.message
        });
    }
};

// UPDATE subcategory
exports.updateSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, description } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Subcategory name is required'
            });
        }

        const subcategory = await Subcategory.findById(id);

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        // Check if another subcategory has the same name in the category
        const existingSubcategory = await Subcategory.findOne({
            _id: { $ne: id },
            name: new RegExp(`^${name.trim()}$`, 'i'),
            category: category || subcategory.category
        });

        if (existingSubcategory) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory name already exists in this category'
            });
        }

        // If category changed, update both old and new category
        if (category && category !== subcategory.category) {
            await Category.findByIdAndUpdate(
                subcategory.category,
                { $pull: { subcategories: subcategory.name } }
            );
            await Category.findByIdAndUpdate(
                category,
                { $push: { subcategories: name.trim() } }
            );
        } else if (name.trim() !== subcategory.name) {
            // If only name changed, update category array
            await Category.findByIdAndUpdate(
                subcategory.category,
                {
                    $pull: { subcategories: subcategory.name },
                    $push: { subcategories: name.trim() }
                }
            );
        }

        const updatedSubcategory = await Subcategory.findByIdAndUpdate(
            id,
            {
                name: name.trim(),
                category: category || subcategory.category,
                description: description?.trim() || ''
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Subcategory updated successfully',
            data: updatedSubcategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating subcategory',
            error: error.message
        });
    }
};

// DELETE subcategory
exports.deleteSubcategory = async (req, res) => {
    try {
        const { id } = req.params;

        const subcategory = await Subcategory.findById(id);

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        // Remove from category's subcategories array
        await Category.findByIdAndUpdate(
            subcategory.category,
            { $pull: { subcategories: subcategory.name } }
        );

        const deletedSubcategory = await Subcategory.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Subcategory deleted successfully',
            data: deletedSubcategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting subcategory',
            error: error.message
        });
    }
};
