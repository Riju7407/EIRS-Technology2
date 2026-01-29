const Product = require('../model/productSchema.js');

exports.createProduct = async (req, res) => {
    try {
        console.log('📦 Creating product with data:', req.body);
        const product = new Product(req.body);
        await product.save();
        console.log('✅ Product saved:', product);
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('❌ Error creating product:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        console.log('📝 Updating product', req.params.id, 'with data:', req.body);
        
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        console.log('✅ Product updated:', product);
        res.json(product);
    } catch (error) {
        console.error('❌ Error updating product:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all unique subcategories
exports.getAllSubcategories = async (req, res) => {
    try {
        const subcategories = await Product.distinct('subcategory');
        const filteredSubcategories = subcategories.filter(sub => sub && sub.trim() !== '');
        res.json({
            success: true,
            data: filteredSubcategories
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get products by subcategory
exports.getProductsBySubcategory = async (req, res) => {
    try {
        const { subcategory } = req.params;
        const products = await Product.find({ subcategory });
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Add subcategory to product
exports.addSubcategoryToProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { subcategory } = req.body;
        
        if (!subcategory || subcategory.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Subcategory is required'
            });
        }
        
        const product = await Product.findByIdAndUpdate(
            productId,
            { subcategory: subcategory.trim() },
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Subcategory added successfully',
            data: product
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};
