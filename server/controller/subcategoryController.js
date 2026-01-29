const Subcategory = require('../model/subcategorySchema.js');

// Create new subcategory
exports.createSubcategory = async (req, res) => {
    try {
        const { name, category, description, icon } = req.body;

        if (!name || !category) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory name and category are required'
            });
        }

        const subcategory = new Subcategory({
            name: name.trim(),
            category: category.trim(),
            description: description || '',
            icon: icon || ''
        });

        await subcategory.save();

        res.status(201).json({
            success: true,
            message: 'Subcategory created successfully',
            data: subcategory
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all subcategories
exports.getAllSubcategories = async (req, res) => {
    try {
        const subcategories = await Subcategory.find();
        res.json({
            success: true,
            data: subcategories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get subcategories by category
exports.getSubcategoriesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const subcategories = await Subcategory.find({ category: category });

        res.json({
            success: true,
            data: subcategories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get subcategory by ID
exports.getSubcategoryById = async (req, res) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id);

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        res.json({
            success: true,
            data: subcategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update subcategory
exports.updateSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, description, icon } = req.body;

        const subcategory = await Subcategory.findByIdAndUpdate(
            id,
            {
                name: name || undefined,
                category: category || undefined,
                description: description || undefined,
                icon: icon || undefined
            },
            { new: true, runValidators: true }
        );

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        res.json({
            success: true,
            message: 'Subcategory updated successfully',
            data: subcategory
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete subcategory
exports.deleteSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        const subcategory = await Subcategory.findByIdAndDelete(id);

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        res.json({
            success: true,
            message: 'Subcategory deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
