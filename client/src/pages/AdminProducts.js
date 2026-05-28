import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaEdit,
  FaPlus,
  FaImage,
  FaStar,
  FaSearch,
  FaBoxOpen,
} from "react-icons/fa";
import axios from "axios";
import { productService } from "../services/api";
import api from "../services/api";
import ProductReviewsSection from "../components/ProductReviewsSection";
import AdminLayout from "../components/AdminLayout";
import "../styles/AdminPages.css";

const AdminProducts = () => {
  const navigate = useNavigate();
  const [subLoading, setSubLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [submenus, setSubmenus] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedProductForReviews, setSelectedProductForReviews] =
    useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    subcategory: "",
    submenu: "",
    channels: "",
    hsn: "",
    brand: "",
    description: "",
    modelNo: "",
    image: "",
    images: ["", "", "", "", ""], // Support for 5 images
    price: "",
    stock: "",
    cameraResolution: "",
    nvrChannels: "",
    poeSwitch: "",
    discount: 0,
  });
  const isLoadingEdit = useRef(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);
  const API_ROOT = (
    process.env.REACT_APP_API_URL || "http://localhost:5000"
  ).replace(/\/$/, "");

  const API_BASE = `${API_ROOT}/api`;

  useEffect(() => {
    if (isLoadingEdit.current) return;
    if (formData.category) {
      fetchSubcategoriesByCategory(formData.category);

      const selectedCategory = categories.find(
        (cat) => cat._id === formData.category,
      );
      if (selectedCategory && selectedCategory.subcategories) {
        const subcategoryExists = selectedCategory.subcategories.some((sub) => {
          // object case
          if (typeof sub === "object") {
            return sub.name === formData.subcategory;
          }

          // string case
          return sub === formData.subcategory;
        });

        if (!subcategoryExists) {
          setFormData((prev) => ({
            ...prev,
            subcategory: "",
            submenu: "",
            channels: "",
          }));
        }
      }
    } else {
      setSubcategories([]);
      setSubmenus([]);
      setChannels([]);
      setFormData((prev) => ({
        ...prev,
        subcategory: "",
        submenu: "",
        channels: "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.category]);

  // Handle submenu options when HD Camera, IP Camera Solutions, or Camera subcategory is selected
  useEffect(() => {
    if (isLoadingEdit.current) return; // Don't interfere while loading edit data
    if (formData.subcategory === "HD Camera (Analog CCTV)") {
      setSubmenus(["Camera", "SMPS", "DVR"]);
      // Only reset channels, not submenu
      setChannels([]);
    } else if (formData.subcategory === "IP Camera Solutions") {
      setSubmenus(["Camera", "NVR", "POE"]);
      // Only reset channels, not submenu
      setChannels([]);
    } else if (formData.subcategory === "Camera") {
      setSubmenus(["2MP", "4MP", "6MP"]);
      // Only reset channels, not submenu
      setChannels([]);
    } else {
      setSubmenus([]);
      setChannels([]);
      setFormData((prev) => ({ ...prev, submenu: "", channels: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.subcategory]);

  // Handle channel options based on submenu selection
  useEffect(() => {
    if (isLoadingEdit.current) return; // Don't interfere while loading edit data
    if (formData.submenu === "Camera") {
      setChannels(["2MP", "4MP", "6MP"]);
    } else if (formData.submenu === "SMPS") {
      setChannels(["4CH", "8CH", "16CH"]);
    } else if (formData.submenu === "NVR") {
      setChannels(["4CH", "8CH", "16CH", "32CH"]);
    } else if (formData.submenu === "DVR") {
      setChannels(["4CH", "8CH", "16CH", "32CH"]);
    } else if (formData.submenu === "POE") {
      setChannels(["4CH", "8CH", "16CH"]);
    } else {
      setChannels([]);
    }
    // Don't reset channels value here - let user select it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.submenu]);

  const fetchSubcategoriesByCategory = async (categoryId) => {
    try {
setSubLoading(true);      

      const response = await axios.get(`${API_BASE}/subcategories`);

      console.log("SUBCATEGORY RESPONSE:", response.data);

     const allSubcategories =
  response.data?.data ||
  response.data?.subcategories ||
  response.data ||
  [];

      console.log("SUB API FULL:", response.data);

      const filtered = allSubcategories.filter((sub) => {
        const subCategoryId =
  sub.category?._id || sub.category || "";

return subCategoryId?.toString() === categoryId?.toString();

        return String(subCategoryId) === String(categoryId);
      });

      setSubcategories(filtered);
    } catch (error) {
      console.error("Error fetching subcategories:", error);

      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };
  const getCategoryName = (categoryData) => {
    // populated object case
    if (typeof categoryData === "object" && categoryData !== null) {
      return categoryData.name || "-";
    }

    // normal id case
    const category = categories.find((cat) => cat._id === categoryData);

    return category?.name || "-";
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_BASE}/categories`);

      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // Fetch up to 1000 products so all products are always visible to admin
      const response = await productService.getAllProducts(1, 1000, true);
      setProducts(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      if (error.status === 401 || error.response?.status === 401) {
        navigate("/signin");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      const result = await productService.toggleFeatured(product._id);
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, isFeatured: result.isFeatured } : p,
        ),
      );
      productService.clearProductCache();
    } catch (error) {
      alert("Failed to update featured status: " + (error.message || error));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`✏️ Field changed: ${name} = ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [editLoadingId, setEditLoadingId] = useState(null);
  // Ref to block useEffects from resetting form fields while edit data is loading
  

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB");
      return;
    }

    try {
      setUploadingIndex(index);
      const fd = new FormData();
      fd.append("image", file);

      const response = await api.post("/auth/upload-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const cloudinaryUrl = response.data.url;
      setFormData((prev) => {
        const newImages = [...prev.images];
        newImages[index] = cloudinaryUrl;
        return {
          ...prev,
          images: newImages,
          image: index === 0 ? cloudinaryUrl : prev.image,
        };
      });
    } catch (err) {
      console.error("Image upload error:", err);
      alert(
        "Image upload failed: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setUploadingIndex(null);
      // Reset file input so the same file can be re-selected if needed
      e.target.value = "";
    }
  };

  const handleImageUrlChange = (e, index) => {
    const url = e.target.value.trim();
    setFormData((prev) => {
      const newImages = [...prev.images];
      newImages[index] = url;
      return {
        ...prev,
        images: newImages,
        // Also set as primary image if it's the first image
        image: index === 0 ? url : prev.image,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.productName || !formData.category || !formData.description) {
      alert(
        "Please fill in all required fields (Product Name, Category, Description)",
      );
      return;
    }

    // Prepare data with proper types
    const submitData = {
      productName: formData.productName,
      hsn: formData.hsn || "",
      category: formData.category,
      subcategory: formData.subcategory || "",
      submenu: formData.submenu || "",
      channels: formData.channels || "",
      brand: formData.brand || "",
      description: formData.description,
      modelNo: formData.modelNo || "",
      image: formData.image || "", // Primary image
      images: formData.images.filter((img) => img !== ""), // Filter out empty images
      price: formData.price !== "" ? parseFloat(formData.price) : 0,
      stock: formData.stock !== "" ? parseInt(formData.stock, 10) : 0,
      discount: formData.discount !== "" ? parseInt(formData.discount, 10) : 0,
      cameraResolution: formData.cameraResolution || "",
      nvrChannels: formData.nvrChannels || "",
      poeSwitch: formData.poeSwitch || "",
    };

    console.log("📤 Full Form Data Before Submit:", formData);
    console.log("📤 Submitting product data:", submitData);
    console.log("📌 ModelNo being sent:", submitData.modelNo);

    try {
      if (editingId) {
        await productService.updateProduct(editingId, submitData);
        alert("Product updated successfully!");
      } else {
        await productService.createProduct(submitData);
        alert("Product added successfully!");
      }
      // Clear product cache to ensure new/updated products appear immediately on homepage
      productService.clearProductCache();
      fetchProducts();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product: " + (error.message || "Unknown error"));
    }
  };

  const handleEdit = async (product) => {
    try {
      setEditLoadingId(product._id);
      isLoadingEdit.current = true; // Block cascade useEffects
      // Fetch full product data — list query omits description & images
      const p = await productService.getProductById(product._id);

      setEditingId(p._id);

      // Build images array:
      // Prefer p.images (plural array). If empty/missing, fall back to p.image (singular).
      let imagesList =
        Array.isArray(p.images) && p.images.length > 0
          ? [...p.images]
          : p.image
            ? [p.image]
            : [];

      // Pad to 5 slots
      while (imagesList.length < 5) imagesList.push("");

      // Set ALL form fields in one atomic update
      setFormData({
        productName: p.productName || "",
          hsn: p.hsn || "", 

        category:
          typeof p.category === "object"
            ? p.category?._id || ""
            : p.category || "",
        subcategory:
          typeof p.subcategory === "object"
            ? p.subcategory?._id || ""
            : p.subcategory || "",
        submenu: p.submenu || "",
        channels: p.channels || "",
        brand: p.brand || "",
        description: p.description || "",
        modelNo: p.modelNo || "",
        image: p.image || imagesList[0] || "",
        images: imagesList,
        price: p.price !== null && p.price !== undefined ? p.price : "",
        stock: p.stock !== null && p.stock !== undefined ? p.stock : "",
        cameraResolution: p.cameraResolution || "",
        nvrChannels: p.nvrChannels || "",
        poeSwitch: p.poeSwitch || "",
        discount:
          p.discount !== null && p.discount !== undefined ? p.discount : 0,
      });

      if (p.category) {
        fetchSubcategoriesByCategory(
          typeof p.category === "object" ? p.category._id : p.category,
        );
      }
      setShowForm(true);
    } catch (error) {
      console.error("Error loading product for edit:", error);
      alert("Failed to load product details. Please try again.");
    } finally {
      setEditLoadingId(null);
      // Allow a tick before unblocking, so React batches the formData setState first
      setTimeout(() => {
        isLoadingEdit.current = false;
      }, 100);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        console.log("🗑️ Deleting product with ID:", id);
        const response = await productService.deleteProduct(id);
        console.log("✅ Delete response:", response);

        // Remove from UI immediately
        setProducts(products.filter((p) => p._id !== id));

        // Clear product cache for fresh data
        productService.clearProductCache();

        alert("✅ Product deleted successfully!");
      } catch (error) {
        console.error("❌ Error deleting product:", error);
        alert(
          "❌ Error deleting product: " + (error.message || "Unknown error"),
        );
      }
    }
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      hsn: "",
      category: "",
      subcategory: "",
      submenu: "",
      channels: "",
      brand: "",
      description: "",
      modelNo: "",
      image: "",
      images: ["", "", "", "", ""], // Reset images array
      price: "",
      stock: "",
      cameraResolution: "",
      nvrChannels: "",
      poeSwitch: "",
      discount: 0,
    });
    setSubmenus([]);
    setChannels([]);
    setEditingId(null);
    setShowForm(false);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      p.productName?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.modelNo?.toLowerCase().includes(q);
    const matchesCategory =
      !filterCategory ||
      (typeof p.category === "object"
        ? p.category?._id === filterCategory
        : p.category === filterCategory);
    return matchesSearch && matchesCategory;
  });

  console.log(fetchSubcategoriesByCategory);
  console.log(categories);
  console.log("SUBCATEGORIES:", subcategories);
  return (
    <AdminLayout pageTitle="Products" breadcrumbs={[{ label: "Products" }]}>
      <div className="ap-page">
        {/* ── PAGE HEADER ── */}
        <div className="ap-header">
          <div className="ap-header-text">
            <h1>Products Management</h1>
            <p>
              {products.length} product{products.length !== 1 ? "s" : ""} in
              catalog
            </p>
          </div>
          <div className="ap-header-actions">
            {!showForm ? (
              <button
                className="ap-btn ap-btn-primary"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                <FaPlus /> Add Product
              </button>
            ) : (
              <button className="ap-btn ap-btn-secondary" onClick={resetForm}>
                ✕ Cancel
              </button>
            )}
          </div>
        </div>

        {/* ── ADD / EDIT FORM PANEL ── */}
        {showForm && (
          <form onSubmit={handleSubmit} className="ap-form-panel">
            <div className="ap-form-panel-header">
              <h2>{editingId ? "✏️ Edit Product" : "➕ Add New Product"}</h2>
              <button
                type="button"
                className="ap-btn ap-btn-secondary ap-btn-sm"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>

            <div className="ap-form-body">
              {/* Row 1 — Name + Category */}
              <div className="ap-form-row">
                <div className="ap-form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="e.g. Hikvision 2MP IP Camera"
                    required
                  />
                </div>
                <div className="ap-form-group">
  <label>HSN Code</label>
  <input
    type="text"
    name="hsn"
    value={formData.hsn}
    onChange={handleInputChange}
    placeholder="e.g. 85258020"
  />
</div>
                <div className="ap-form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a category</option>

                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2 — Subcategory + Submenu or Channels */}
              <div className="ap-form-row">
                <div className="ap-form-group">
                  <label>Subcategory</label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    disabled={!formData.category}
                  >
                    <option value="">Select subcategory</option>
                    {subcategories.map((subcat, idx) => (
 <option
  key={subcat._id || idx}
  value={
    typeof subcat === "string"
      ? subcat
      : subcat.name
  }
>
  {typeof subcat === "string"
    ? subcat
    : subcat.name}
</option>
))}
                  </select>
                </div>
                {submenus.length > 0 ? (
                  <div className="ap-form-group">
                    <label>Submenu (Type)</label>
                    <select
                      name="submenu"
                      value={formData.submenu}
                      onChange={handleInputChange}
                    >
                      <option value="">Select submenu</option>
                      {submenus.map((sm, idx) => (
                        <option key={idx} value={sm}>
                          {sm}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : channels.length > 0 ? (
                  <div className="ap-form-group">
                    <label>Channels</label>
                    <select
                      name="channels"
                      value={formData.channels}
                      onChange={handleInputChange}
                    >
                      <option value="">Select channels</option>
                      {channels.map((ch, idx) => (
                        <option key={idx} value={ch}>
                          {ch}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="ap-form-group">
                    <label>Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="e.g. Hikvision, Dahua"
                    />
                  </div>
                )}
              </div>

              {/* Row 3 — Brand + Model (only when submenu/channels row is shown above) */}
              {(submenus.length > 0 || channels.length > 0) && (
                <div className="ap-form-row">
                  <div className="ap-form-group">
                    <label>Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="e.g. Hikvision, Dahua"
                    />
                  </div>
                  <div className="ap-form-group">
                    <label>Model No</label>
                    <input
                      type="text"
                      name="modelNo"
                      value={formData.modelNo}
                      onChange={handleInputChange}
                      placeholder="e.g. DS-2CD2121G1-I"
                    />
                  </div>
                </div>
              )}

              {/* Row — Price + Stock */}
              <div className="ap-form-row">
                <div className="ap-form-group">
                  <label>Price / MRP (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="ap-form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                  <small className="ap-form-hint">
                    Enter 0 to mark as out of stock
                  </small>
                </div>
              </div>

              {/* Row — Discount */}
              <div className="ap-form-row">
                <div className="ap-form-group">
                  <label>Discount %</label>
                  <select
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                  >
                    <option value={0}>No Discount</option>
                    {[
                      5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75,
                      80,
                    ].map((d) => (
                      <option key={d} value={d}>
                        {d}% OFF
                      </option>
                    ))}
                  </select>
                  <small className="ap-form-hint">
                    {formData.discount > 0 && formData.price > 0
                      ? `Selling price: ₹${Math.round(formData.price * (1 - formData.discount / 100)).toLocaleString("en-IN")}`
                      : "Select a discount to apply"}
                  </small>
                </div>
                <div className="ap-form-group" />
              </div>

              {/* Row — Model No (when brand already shown in row 2) */}
              {!(submenus.length > 0 || channels.length > 0) && (
                <div className="ap-form-row">
                  <div className="ap-form-group">
                    <label>Model No</label>
                    <input
                      type="text"
                      name="modelNo"
                      value={formData.modelNo}
                      onChange={handleInputChange}
                      placeholder="e.g. DS-2CD2121G1-I"
                    />
                  </div>
                  <div className="ap-form-group" />
                </div>
              )}

              {/* Row — Description */}
              <div className="ap-form-row">
                <div className="ap-form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Enter product description…"
                  />
                </div>
              </div>

              {/* Row — Images */}
              <div className="ap-form-row">
                <div className="ap-form-group full-width">
                  <label>
                    Product Images (up to 5) — first image is the primary
                    display image
                  </label>
                  <div className="ap-img-grid">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className={`ap-img-slot${formData.images[index] ? " has-image" : ""}`}
                      >
                        <div className="ap-img-slot-label">
                          {index === 0 ? "Primary" : `Image ${index + 1}`}
                        </div>
                        {formData.images[index] ? (
                          <div className="ap-img-slot-preview">
                            <img
                              src={formData.images[index]}
                              alt={`Preview ${index + 1}`}
                              className="ap-img-preview"
                            />
                            <button
                              type="button"
                              className="ap-img-remove"
                              onClick={() =>
                                setFormData((prev) => {
                                  const imgs = [...prev.images];
                                  imgs[index] = "";
                                  return {
                                    ...prev,
                                    images: imgs,
                                    image: index === 0 ? "" : prev.image,
                                  };
                                })
                              }
                            >
                              &#x2715;
                            </button>
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              id={`img-${index}`}
                              onChange={(e) => handleImageUpload(e, index)}
                              accept="image/*"
                              style={{ display: "none" }}
                            />
                            <label
                              htmlFor={`img-${index}`}
                              className={`ap-img-upload-label${uploadingIndex === index ? " uploading" : ""}`}
                            >
                              <FaImage size={18} />
                              <span>
                                {uploadingIndex === index
                                  ? "Uploading…"
                                  : "Upload"}
                              </span>
                            </label>
                            <input
                              type="text"
                              className="ap-img-url-input"
                              placeholder="or paste URL"
                              value={formData.images[index] || ""}
                              onChange={(e) => handleImageUrlChange(e, index)}
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="ap-form-actions">
                <button type="submit" className="ap-btn ap-btn-primary">
                  <FaPlus /> {editingId ? "Update Product" : "Add Product"}
                </button>
                <button
                  type="button"
                  className="ap-btn ap-btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ── SEARCH / FILTER TOOLBAR ── */}
        {!showForm && (
          <div className="ap-toolbar">
            <div className="ap-search">
              <FaSearch className="ap-search-icon" />
              <input
                type="text"
                placeholder="Search by name, brand or model…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="ap-filter-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <span className="ap-results-count">
              {filteredProducts.length} result
              {filteredProducts.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* ── PRODUCT TABLE ── */}
        {loading ? (
          <div className="ap-loading">
            <div className="ap-spinner" />
            <p>Loading products…</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category / Brand</th>
                  <th>Model No</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    {/* Product cell */}
                    <td>
                      <div className="ap-product-cell">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.productName}
                            className="ap-product-img"
                          />
                        ) : (
                          <div className="ap-product-img placeholder">
                            <FaImage />
                          </div>
                        )}
                        <div className="ap-product-info">
                          <span className="ap-product-name">
                            {product.productName}
                          </span>
                          {product.subcategory && (
                            <span className="ap-product-cat">
                             {typeof product.subcategory === "object"
  ? product.subcategory?.name
  : subcategories.find(
      (s) => s._id === product.subcategory
    )?.name || "—"}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Category / Brand */}
                    <td>
                      <div
                        style={{
                          fontWeight: 500,
                          color: "#374151",
                          fontSize: "0.875rem",
                        }}
                      >
                        {getCategoryName(product.category)}
                      </div>
                      {product.brand && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#94a3b8",
                            marginTop: 2,
                          }}
                        >
                          {product.brand}
                        </div>
                      )}
                    </td>
                    {/* Model No */}
                    <td style={{ fontSize: "0.82rem", color: "#64748b" }}>
                      {product.modelNo || "—"}
                    </td>
                    {/* Price */}
                    <td>
                      {product.discount > 0 ? (
                        <div>
                          <span
                            className="ap-price"
                            style={{ color: "#16a34a" }}
                          >
                            {Math.round(
                              product.price * (1 - product.discount / 100),
                            ).toLocaleString("en-IN")}
                          </span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "#94a3b8",
                              textDecoration: "line-through",
                              marginLeft: 4,
                            }}
                          >
                            ₹
                            {product.price != null
                              ? Number(product.price).toLocaleString("en-IN")
                              : "—"}
                          </span>
                          <span
                            className="ap-badge ap-badge-yellow"
                            style={{ marginLeft: 4 }}
                          >
                            {product.discount}% OFF
                          </span>
                        </div>
                      ) : (
                        <span className="ap-price">
                          {product.price != null
                            ? Number(product.price).toLocaleString("en-IN")
                            : "—"}
                        </span>
                      )}
                    </td>
                    {/* Stock */}
                    <td>
                      <span
                        className={
                          product.stock > 0 ? "ap-stock-ok" : "ap-stock-low"
                        }
                      >
                        {product.stock != null ? product.stock : 0}
                      </span>
                    </td>
                    {/* Featured toggle */}
                    <td>
                      <button
                        className={`ap-btn ap-btn-sm${product.isFeatured ? " ap-btn-featured-on" : " ap-btn-featured-off"}`}
                        onClick={() => handleToggleFeatured(product)}
                        title={
                          product.isFeatured
                            ? "Remove from Top Products"
                            : "Add to Top Products"
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <FaStar
                          style={{
                            color: product.isFeatured ? "#f59e0b" : "#cbd5e1",
                          }}
                        />
                        {product.isFeatured ? "Featured" : "Feature"}
                      </button>
                    </td>
                    {/* Actions */}
                    <td>
                      <div className="ap-actions">
                        <button
                          className="ap-btn ap-btn-secondary ap-btn-sm"
                          onClick={() => {
                            setShowForm(false);
                            handleEdit(product);
                          }}
                          disabled={editLoadingId === product._id}
                        >
                          <FaEdit />{" "}
                          {editLoadingId === product._id ? "Loading…" : "Edit"}
                        </button>
                        <button
                          className="ap-btn ap-btn-danger ap-btn-sm"
                          onClick={() => handleDelete(product._id)}
                          title="Delete product"
                        >
                          <FaTrash />
                        </button>
                        <button
                          className="ap-btn ap-btn-warning ap-btn-sm"
                          onClick={() =>
                            setSelectedProductForReviews(product._id)
                          }
                          title="View reviews"
                        >
                          <FaStar />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ap-empty">
            <FaBoxOpen className="ap-empty-icon" />
            <h3>
              {searchQuery || filterCategory
                ? "No products match your filters"
                : "No products yet"}
            </h3>
            <p>
              {searchQuery || filterCategory
                ? "Try clearing the search or changing the category filter."
                : 'Click "Add Product" to create your first product.'}
            </p>
          </div>
        )}
      </div>

      {/* ── Product Reviews Modal ── */}
      {selectedProductForReviews && (
        <ProductReviewsSection
          productId={selectedProductForReviews}
          onClose={() => setSelectedProductForReviews(null)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
