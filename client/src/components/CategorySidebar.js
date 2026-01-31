import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useCategoryFilter } from '../context/CategoryFilterContext';
import '../styles/CategorySidebar.css';

// Category Sidebar with filtering - Flipkart style
const CategorySidebar = ({ 
  onCategorySelect = () => {}, 
  onPriceRangeChange = () => {},
  onIPCameraResolutionChange = () => {},
  onNVRChannelChange = () => {},
  onPOESwitchChange = () => {}
}) => {
  const { categories = [], subcategories = [], filters = [], loading } = useCategoryFilter();
  
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedFilters, setSelectedFilters] = useState(new Map());

  // Build categories with their subcategories
  const categoriesWithSubs = categories.map(category => ({
    id: category._id,
    name: category.name,
    subcategories: subcategories
      .filter(sub => sub.categoryId === category._id || sub.categoryName === category.name)
      .map(sub => ({
        id: sub._id,
        name: sub.name
      }))
  }));

  // Fallback categories if no data
  const displayCategories = categoriesWithSubs.length > 0 ? categoriesWithSubs : [
    {
      id: 'cctv',
      name: 'CCTV Cameras',
      subcategories: [
        { id: '1', name: 'IP Camera Solutions' },
        { id: '2', name: 'HD Camera (Analog CCTV)' },
        { id: '3', name: 'CCTV Bundle Packs' },
        { id: '4', name: 'Wi-Fi / 4G Camera' }
      ]
    },
    {
      id: 'cctv-components',
      name: 'CCTV Components',
      subcategories: [
        { id: '5', name: 'NVR (Network Video Recorder)' },
        { id: '6', name: 'DVR (Digital Video Recorder)' },
        { id: '7', name: 'POE Switch' },
        { id: '8', name: 'SMPS (Power Supply)' },
        { id: '9', name: 'Hard Disk' },
        { id: '10', name: 'Cables & Accessories' }
      ]
    },
    {
      id: 'biometric',
      name: 'Biometric Devices',
      subcategories: [
        { id: '11', name: 'Fingerprint Biometric' },
        { id: '12', name: 'Face Recognition Biometric' },
        { id: '13', name: 'Card + Fingerprint Devices' },
        { id: '14', name: 'Time Attendance with Payroll Integration' }
      ]
    },
    {
      id: 'intercom',
      name: 'Intercom System',
      subcategories: [
        { id: '15', name: 'Landline Phones' },
        { id: '16', name: 'Intercom Devices' },
        { id: '17', name: 'EPABX System' },
        { id: '18', name: 'PBX System' }
      ]
    },
    {
      id: 'home-office',
      name: 'Home & Office Security',
      subcategories: [
        { id: '19', name: 'Video Door Phone (VDP/VPP)' },
        { id: '20', name: 'Smart Door Locks' },
        { id: '21', name: 'Access Control System' },
        { id: '22', name: 'Alarm Systems' },
        { id: '23', name: 'Motion Sensors' }
      ]
    },
    {
      id: 'iot',
      name: 'IoT Solutions',
      subcategories: [
        { id: '24', name: 'Smart Sensors' },
        { id: '25', name: 'IoT Devices' },
        { id: '26', name: 'Connected Systems' },
        { id: '27', name: 'Wireless Modules' }
      ]
    },
    {
      id: 'automation',
      name: 'Automation Systems',
      subcategories: [
        { id: '28', name: 'Smart Lighting' },
        { id: '29', name: 'Climate Control' },
        { id: '30', name: 'Access Control' },
        { id: '31', name: 'Integration Modules' }
      ]
    },
    {
      id: 'fire',
      name: 'Fire Alarm Systems',
      subcategories: [
        { id: '32', name: 'Smoke Detectors' },
        { id: '33', name: 'Heat Detectors' },
        { id: '34', name: 'Manual Call Points' },
        { id: '35', name: 'Control Panels' }
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

  const ipCameraResolutions = getFiltersByType('resolution').length > 0
    ? getFiltersByType('resolution')
    : [
        { label: '2 MP IP Camera', value: '2mp', description: 'Budget-friendly, basic surveillance' },
        { label: '4 MP IP Camera', value: '4mp', description: 'Balanced clarity & performance' },
        { label: '6 MP IP Camera', value: '6mp', description: 'High-definition professional monitoring' }
      ];

  const nvrChannels = getFiltersByType('channels').length > 0
    ? getFiltersByType('channels')
    : [
        { label: '4 Channel NVR', value: '4ch' },
        { label: '8 Channel NVR', value: '8ch' },
        { label: '16 Channel NVR', value: '16ch' },
        { label: '32 Channel NVR', value: '32ch' }
      ];

  const poeSwitches = getFiltersByType('poeSwitches')?.length > 0
    ? getFiltersByType('poeSwitches')
    : [
        { label: '4 Port POE', value: '4port' },
        { label: '8 Port POE', value: '8port' },
        { label: '16 Port POE', value: '16port' }
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
                      <input
                        type="checkbox"
                        id={`category-${subcategory.id || subcategory.name}`}
                        className="subcategory-checkbox"
                        checked={selectedCategories.has(subcategory.id || subcategory.name)}
                        onChange={() => {
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

      {/* Brand Filter - Dynamic from API */}
      {brands.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-section-title">Brands</div>
          <div className="specifications-list">
            {brands.map((brand) => (
              <div key={brand.value || brand} className="specification-item">
                <input
                  type="checkbox"
                  id={`brand-${brand.value || brand}`}
                  className="specification-checkbox"
                  checked={selectedBrands.has(brand.value || brand)}
                  onChange={() => handleBrandChange(brand)}
                />
                <label htmlFor={`brand-${brand.value || brand}`} className="specification-label">
                  {brand.label || brand}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IP Camera Resolution Filter - Dynamic */}
      {ipCameraResolutions.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-section-title">IP Camera Resolution</div>
          <div className="specifications-list">
            {ipCameraResolutions.map((resolution) => (
              <div key={resolution.value || resolution.id} className="specification-item">
                <input
                  type="checkbox"
                  id={`resolution-${resolution.value || resolution.id}`}
                  className="specification-checkbox"
                  checked={selectedFilters.has(`resolution-${resolution.value || resolution.id}`)}
                  onChange={() => handleFilterChange('resolution', resolution)}
                />
                <div style={{ flex: 1 }}>
                  <label htmlFor={`resolution-${resolution.value || resolution.id}`} className="specification-label">
                    {resolution.label}
                  </label>
                  {resolution.description && (
                    <div className="specification-description">{resolution.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NVR Channels Filter - Dynamic */}
      {nvrChannels.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-section-title">NVR Channel Options</div>
          <div className="specifications-list">
            {nvrChannels.map((channel) => (
              <div key={channel.value || channel.id} className="specification-item">
                <input
                  type="checkbox"
                  id={`nvr-${channel.value || channel.id}`}
                  className="specification-checkbox"
                  checked={selectedFilters.has(`channels-${channel.value || channel.id}`)}
                  onChange={() => handleFilterChange('channels', channel)}
                />
                <label htmlFor={`nvr-${channel.value || channel.id}`} className="specification-label">
                  {channel.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POE Switch Filter - Dynamic */}
      {poeSwitches.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-section-title">POE Switch Options</div>
          <div className="specifications-list">
            {poeSwitches.map((poeSwitch) => (
              <div key={poeSwitch.value || poeSwitch.id} className="specification-item">
                <input
                  type="checkbox"
                  id={`poe-${poeSwitch.value || poeSwitch.id}`}
                  className="specification-checkbox"
                  checked={selectedFilters.has(`poe-${poeSwitch.value || poeSwitch.id}`)}
                  onChange={() => handleFilterChange('poe', poeSwitch)}
                />
                <label htmlFor={`poe-${poeSwitch.value || poeSwitch.id}`} className="specification-label">
                  {poeSwitch.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters Button */}
      <button className="clear-filters-btn" onClick={handleClearFilters}>Clear All Filters</button>
    </div>
  );
};

export default CategorySidebar;
