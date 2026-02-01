import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useCategoryFilter } from '../context/CategoryFilterContext';
import '../styles/CategorySidebar.css';

// Category Sidebar with filtering - Flipkart style
const CategorySidebar = ({ 
  onCategorySelect = () => {}, 
  onPriceRangeChange = () => {}
}) => {
  const { categories = [], subcategories = [], filters = [], loading } = useCategoryFilter();
  
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedFilters, setSelectedFilters] = useState(new Map());

  // Build categories with their subcategories
  const categoriesWithSubs = categories.map(category => {
    const categorySubs = subcategories.filter(
      sub => sub.categoryId === category._id || sub.category === category.name
    );
    
    // Group subcategories by their parent (handle nested structure)
    const grouped = {};
    const mainSubs = [];
    
    categorySubs.forEach(sub => {
      // Check if this is a top-level subcategory or a nested one
      const isNested = sub.name.includes(' - ');
      if (!isNested) {
        mainSubs.push({
          id: sub._id,
          name: sub.name,
          children: []
        });
      }
    });
    
    // Attach nested items to their parents
    categorySubs.forEach(sub => {
      const isNested = sub.name.includes(' - ');
      if (isNested) {
        const parentName = sub.name.split(' - ')[0];
        const parent = mainSubs.find(s => s.name === parentName);
        if (parent) {
          parent.children.push({
            id: sub._id,
            name: sub.name.split(' - ')[1]
          });
        }
      }
    });
    
    return {
      id: category._id,
      name: category.name,
      subcategories: mainSubs.length > 0 ? mainSubs : categorySubs.map(sub => ({
        id: sub._id,
        name: sub.name,
        children: []
      }))
    };
  });

  // Fallback categories if no data
  const displayCategories = categoriesWithSubs.length > 0 ? categoriesWithSubs : [
    {
      id: 'cctv',
      name: 'CCTV Camera',
      subcategories: [
        { 
          id: '1', 
          name: 'IP Camera',
          children: [
            { id: '1a', name: 'Camera' },
            { id: '1b', name: 'NVR' },
            { id: '1c', name: 'POE' }
          ]
        },
        { 
          id: '2', 
          name: 'HD Camera',
          children: [
            { id: '2a', name: 'Camera' },
            { id: '2b', name: 'SMPS' },
            { id: '2c', name: 'DVR' }
          ]
        },
        { id: '3', name: 'Wi-Fi/4G Camera', children: [] },
        { id: '4', name: 'CCTV Bundle Pack', children: [] }
      ]
    },
    {
      id: 'biometric',
      name: 'Biometric Devices',
      subcategories: [
        { id: '11', name: 'Fingerprint Biometric', children: [] },
        { id: '12', name: 'Face Recognition Biometric', children: [] },
        { id: '13', name: 'Card + Fingerprint Devices', children: [] },
        { id: '14', name: 'Time Attendance with Payroll Integration', children: [] }
      ]
    },
    {
      id: 'intercom',
      name: 'Intercom System',
      subcategories: [
        { id: '15', name: 'EPBX', children: [] },
        { id: '16', name: 'IPBX', children: [] }
      ]
    },
    {
      id: 'home-office',
      name: 'Home & Office Security',
      subcategories: [
        { id: '19', name: 'Video Door Phone (VDP/VPP)', children: [] },
        { id: '20', name: 'Smart Door Locks', children: [] },
        { id: '21', name: 'Access Control System', children: [] },
        { id: '22', name: 'Alarm Systems', children: [] },
        { id: '23', name: 'Motion Sensors', children: [] }
      ]
    },
    {
      id: 'fire',
      name: 'Fire Alarm Systems',
      subcategories: [
        { id: '32', name: 'Smoke Detectors', children: [] },
        { id: '33', name: 'Heat Detectors', children: [] },
        { id: '34', name: 'Manual Call Points', children: [] },
        { id: '35', name: 'Control Panels', children: [] }
      ]
    }
  ];

  // Default price ranges
  const priceRanges = [
    { id: 'all', label: 'All Prices' },
    { id: '0-5000', label: '₹0 - ₹5,000' },
    { id: '5000-10000', label: '₹5,000 - ₹10,000' },
    { id: '10000-25000', label: '₹10,000 - ₹25,000' },
    { id: '25000-50000', label: '₹25,000 - ₹50,000' },
    { id: '50000-100000', label: '₹50,000 - ₹1,00,000' },
    { id: '100000+', label: '₹1,00,000+' }
  ];

  // Get filters by type from API
  const getFiltersByType = (type) => {
    const filterObj = filters.find(f => f.type === type);
    return filterObj ? filterObj.options : [];
  };

  const brands = getFiltersByType('brand').length > 0 
    ? getFiltersByType('brand')
    : [
        { label: 'HIKVISION', value: 'hikvision' },
        { label: 'DAHUA', value: 'dahua' },
        { label: 'UNIVIEW', value: 'uniview' },
        { label: 'SUNELL', value: 'sunell' },
        { label: 'AXIS', value: 'axis' },
        { label: 'BOSCH', value: 'bosch' }
      ];

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handlePriceChange = (priceId) => {
    setSelectedPrice(priceId);
    if (onPriceRangeChange) {
      onPriceRangeChange(priceId);
    }
  };

  const handleBrandChange = (brand) => {
    const newBrands = new Set(selectedBrands);
    const brandValue = brand.value || brand;
    if (newBrands.has(brandValue)) {
      newBrands.delete(brandValue);
    } else {
      newBrands.add(brandValue);
    }
    setSelectedBrands(newBrands);
    if (onCategorySelect) {
      onCategorySelect(brand.label || brand);
    }
  };

  const handleClearFilters = () => {
    setExpandedCategory(null);
    setSelectedPrice('all');
    setSelectedBrands(new Set());
    setSelectedCategories(new Set());
    setSelectedFilters(new Map());
  };

  const handleFilterChange = (filterType, filterValue) => {
    const newFilters = new Map(selectedFilters);
    const key = `${filterType}-${filterValue.value || filterValue}`;
    
    if (newFilters.has(key)) {
      newFilters.delete(key);
    } else {
      newFilters.set(key, filterValue);
    }
    setSelectedFilters(newFilters);
  };

  if (loading) {
    return <div className="category-sidebar"><p>Loading filters...</p></div>;
  }

  return (
    <div className="category-sidebar">
      {/* Category Filter */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Categories</div>
        <div className="categories-list">
          {displayCategories.map((category) => (
            <div key={category.id} className="category-item">
              <div
                className="category-header"
                onClick={() => toggleCategory(category.id)}
              >
                <span className="category-name">{category.name}</span>
                <span className="expand-icon">
                  {expandedCategory === category.id ? (
                    <FaChevronUp size={14} />
                  ) : (
                    <FaChevronDown size={14} />
                  )}
                </span>
              </div>
              {expandedCategory === category.id && (
                <div className="subcategories">
                  {category.subcategories.map((subcategory) => (
                    <div
                      key={subcategory.id || subcategory.name}
                      className="subcategory-item"
                    >
                      <div className="subcategory-main">
                        <input
                          type="checkbox"
                          id={`category-${subcategory.id || subcategory.name}`}
                          className="subcategory-checkbox"
                          checked={selectedCategories.has(subcategory.id || subcategory.name)}
                          onChange={(e) => {
                            e.preventDefault();
                            const newCategories = new Set(selectedCategories);
                            const subId = subcategory.id || subcategory.name;
                            if (newCategories.has(subId)) {
                              newCategories.delete(subId);
                            } else {
                              newCategories.add(subId);
                            }
                            setSelectedCategories(newCategories);
                            if (onCategorySelect) {
                              onCategorySelect(subcategory.name || subcategory);
                            }
                          }}
                        />
                        <label htmlFor={`category-${subcategory.id || subcategory.name}`} style={{ cursor: 'pointer' }}>
                          {subcategory.name || subcategory}
                        </label>
                      </div>
                      
                      {/* Render nested children if they exist */}
                      {subcategory.children && subcategory.children.length > 0 && (
                        <div className="subcategory-children">
                          {subcategory.children.map((child) => (
                            <div key={child.id} className="child-item">
                              <input
                                type="checkbox"
                                id={`child-${child.id}`}
                                className="child-checkbox"
                                checked={selectedCategories.has(child.id)}
                                onChange={(e) => {
                                  e.preventDefault();
                                  const newCategories = new Set(selectedCategories);
                                  if (newCategories.has(child.id)) {
                                    newCategories.delete(child.id);
                                  } else {
                                    newCategories.add(child.id);
                                  }
                                  setSelectedCategories(newCategories);
                                  if (onCategorySelect) {
                                    onCategorySelect(child.name);
                                  }
                                }}
                              />
                              <label htmlFor={`child-${child.id}`} style={{ cursor: 'pointer' }}>
                                {child.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Price Range</div>
        <div className="price-list">
          {priceRanges.map((range) => (
            <div key={range.id} className="price-item">
              <input
                type="radio"
                id={`price-${range.id}`}
                name="price"
                value={range.id}
                checked={selectedPrice === range.id}
                onChange={() => handlePriceChange(range.id)}
                className="price-radio"
              />
              <label htmlFor={`price-${range.id}`} className="price-label">
                {range.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Additional filters section removed */}

      {/* Clear Filters Button */}
      <button className="clear-filters-btn" onClick={handleClearFilters}>Clear All Filters</button>
    </div>
  );
};

export default CategorySidebar;
