const Product = require('../model/productSchema.js');

exports.createProduct = async (req, res) => {
    try {
        console.log('📦 Creating product with data:', JSON.stringify(req.body, null, 2));
        console.log('📌 ModelNo value:', req.body.modelNo);
        
        const product = new Product(req.body);
        await product.save();
        
        console.log('✅ Product saved:', JSON.stringify(product, null, 2));
        console.log('📌 Saved ModelNo:', product.modelNo);
        
        // Clear all caches when new product is added
        productsCache.clear();
        totalCountCache = null;
        totalCountTimestamp = null;
        
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

// Multi-level cache for products (refresh every 10 minutes)
let productsCache = new Map(); // Cache per page
let totalCountCache = null;
let totalCountTimestamp = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const COUNT_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for count

exports.getAllProducts = async (req, res) => {
    try {
        const now = Date.now();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const cacheKey = `${page}_${limit}`;
        
        // Check page-specific cache
        const cachedPage = productsCache.get(cacheKey);
        if (cachedPage && (now - cachedPage.timestamp) < CACHE_DURATION) {
            console.log(`✅ Returning cached page ${page}`);
            res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
            res.set('X-Cache', 'HIT');
            return res.json(cachedPage.data);
        }
        
        // Use cached total count if available
        let total;
        if (totalCountCache !== null && totalCountTimestamp && (now - totalCountTimestamp) < COUNT_CACHE_DURATION) {
            total = totalCountCache;
        } else {
            total = await Product.countDocuments();
            totalCountCache = total;
            totalCountTimestamp = now;
        }
        
        // Fetch products with optimized fields - truncate description for list view
        const products = await Product.find()
            .select('_id productName category subcategory submenu channels brand price image stock modelNo isFeatured discount')
            .lean() // Returns plain JavaScript objects, not Mongoose documents
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 }) // Most recent first
            .exec();
        
        const response = {
            data: products,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
        
        // Cache this page
        productsCache.set(cacheKey, {
            data: response,
            timestamp: now
        });
        
        // Limit cache size to 10 pages
        if (productsCache.size > 10) {
            const firstKey = productsCache.keys().next().value;
            productsCache.delete(firstKey);
        }
        
        // Set cache headers for CDN/browser caching
        res.set('Cache-Control', 'public, max-age=300'); // 5 minutes for browsers
        res.set('X-Cache', 'MISS');
        res.json(response);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .lean()
            .exec();
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        console.log('📝 Updating product', req.params.id, 'with data:', JSON.stringify(req.body, null, 2));
        
        // Clear caches on update
        productsCache.clear();
        totalCountCache = null;
        totalCountTimestamp = null;
        console.log('📌 ModelNo value to update:', req.body.modelNo);
        
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        
        // Clear cache when product is updated
        productsCache = new Map();
        totalCountCache = null;
        totalCountTimestamp = null;
        
        console.log('✅ Product updated:', JSON.stringify(product, null, 2));
        console.log('📌 Updated ModelNo:', product.modelNo);
        
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
        
        // Clear all caches when product is deleted
        productsCache.clear();
        totalCountCache = null;
        totalCountTimestamp = null;
        
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get only featured products (for Homepage Top Products)
exports.getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isFeatured: true })
            .select('_id productName category subcategory brand price image stock modelNo isFeatured discount')
            .lean()
            .sort({ updatedAt: -1 })
            .exec();
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle isFeatured on a product (admin only)
exports.toggleFeatured = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        product.isFeatured = !product.isFeatured;
        await product.save();

        // Clear server-side cache
        productsCache.clear();
        totalCountCache = null;
        totalCountTimestamp = null;

        res.json({ success: true, isFeatured: product.isFeatured });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
