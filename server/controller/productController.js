const Product = require('../model/productSchema.js');
const Category = require('../model/categorySchema');
const mongoose = require("mongoose");

exports.createProduct = async (req, res) => {
  try {
    console.log("📦 Creating product:", req.body);

    const { category } = req.body;

    // ❌ INVALID ID BLOCK
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID sent",
        received: category,
      });
    }

    const product = new Product({
      ...req.body,
      category: new mongoose.Types.ObjectId(category),
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });

  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(400).json({
      success: false,
      message: error.message,
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
  console.log("🔥 ===== API HIT =====");
  console.log("🔥 REQUEST QUERY:", req.query);
  console.log("🔥 REQUEST URL:", req.originalUrl);

  try {
    const now = Date.now();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    console.log("📦 PAGE:", page, "LIMIT:", limit, "SKIP:", skip);

    const cacheKey = `${page}_${limit}`;

    // =========================
    // CACHE CHECK
    // =========================
    const cachedPage = productsCache.get(cacheKey);
    if (cachedPage && (now - cachedPage.timestamp) < CACHE_DURATION) {
      console.log(`✅ CACHE HIT for page ${page}`);
      res.set("Cache-Control", "public, max-age=300");
      res.set("X-Cache", "HIT");
      return res.json(cachedPage.data);
    }

    // =========================
    // TOTAL COUNT CACHE
    // =========================
    let total;
    if (
      totalCountCache !== null &&
      totalCountTimestamp &&
      (now - totalCountTimestamp) < COUNT_CACHE_DURATION
    ) {
      total = totalCountCache;
      console.log("📊 Total Count from CACHE:", total);
    } else {
      total = await Product.countDocuments();
      totalCountCache = total;
      totalCountTimestamp = now;
      console.log("📊 Total Count from DB:", total);
    }

    // =========================
    // DEBUG FILTER (IMPORTANT)
    // =========================
    let filter = {};

    if (req.query.category) {
      console.log("⚠️ RAW CATEGORY VALUE:", req.query.category);

      // SAFE CHECK (IMPORTANT)
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        filter.category = req.query.category;
        console.log("✅ VALID ObjectId category used");
      } else {
        console.warn("❌ INVALID category (IGNORED):", req.query.category);
      }
    }

    console.log("🎯 FINAL FILTER:", filter);

    // =========================
    // DB QUERY
    // =========================
    const products = await Product.find(filter)
      .populate("category", "name")
      .select("_id productName category subcategory submenu channels brand price image stock modelNo hsn isFeatured discount")
      .lean()
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .exec();

    console.log("📦 PRODUCTS FOUND:", products.length);

    const response = {
      data: products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    // =========================
    // CACHE STORE
    // =========================
    productsCache.set(cacheKey, {
      data: response,
      timestamp: now,
    });

    if (productsCache.size > 10) {
      const firstKey = productsCache.keys().next().value;
      productsCache.delete(firstKey);
      console.log("🧹 Old cache cleared:", firstKey);
    }

    res.set("Cache-Control", "public, max-age=300");
    res.set("X-Cache", "MISS");

    res.json(response);
  } catch (error) {
    console.error("❌ FULL ERROR:", error);
    console.error("❌ ERROR NAME:", error.name);
    console.error("❌ ERROR PATH:", error.path);
    console.error("❌ ERROR VALUE:", error.value);

    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        .populate("category", "name") 
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
    let updateData = { ...req.body };

    if (req.body.category) {
      const categoryDoc = await Category.findById(req.body.category);
      if (categoryDoc) {
        if (req.body.category) {
  updateData.category = req.body.category; // ALWAYS ObjectId
}// ✅ convert ID to name
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ message: 'Product not found' });

    productsCache.clear();
    totalCountCache = null;
    totalCountTimestamp = null;

    res.json(product);
  } catch (error) {
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
        .populate("category", "name") 
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
