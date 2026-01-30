import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import '../styles/CategorySidebar.css';

// Category Sidebar with filtering - Flipkart style
const CategorySidebar = ({ 
  onCategorySelect = () => {}, 
  onPriceRangeChange = () => {},
  onIPCameraResolutionChange = () => {},
  onNVRChannelChange = () => {},
  onPOESwitchChange = () => {}
}) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedIPCameraResolution, setSelectedIPCameraResolution] = useState(new Set());
  const [selectedNVRChannels, setSelectedNVRChannels] = useState(new Set());
  const [selectedPOESwitch, setSelectedPOESwitch] = useState(new Set());

  const categories = [
    {
      id: 'cctv',
      name: 'CCTV Cameras',
      subcategories: [
        'IP Camera Solutions',
        'HD Camera (Analog CCTV)',
        'CCTV Bundle Packs',
        'Wi-Fi / 4G Camera'
      ]
    },
    {
      id: 'cctv-components',
      name: 'CCTV Components',
      subcategories: [
        'NVR (Network Video Recorder)',
        'DVR (Digital Video Recorder)',
        'POE Switch',
        'SMPS (Power Supply)',
        'Hard Disk',
        'Cables & Accessories'
      ]
    },
    {
      id: 'biometric',
      name: 'Biometric Devices',
      subcategories: [
        'Fingerprint Biometric',
        'Face Recognition Biometric',
        'Card + Fingerprint Devices',
        'Time Attendance with Payroll Integration'
      ]
    },
    {
      id: 'intercom',
      name: 'Intercom System',
      subcategories: [
        'Landline Phones',
        'Intercom Devices',
        'EPABX System',
        'PBX System'
      ]
    },
    {
      id: 'home-office',
      name: 'Home & Office Security',
      subcategories: [
        'Video Door Phone (VDP/VPP)',
        'Smart Door Locks',
        'Access Control System',
        'Alarm Systems',
        'Motion Sensors'
      ]
    },
    {
      id: 'iot',
      name: 'IoT Solutions',
      subcategories: [
        'Smart Sensors',
        'IoT Devices',
        'Connected Systems',
        'Wireless Modules'
      ]
    },
    {
      id: 'automation',
      name: 'Automation Systems',
      subcategories: [
        'Smart Lighting',
        'Climate Control',
        'Access Control',
        'Integration Modules'
      ]
    },
    {
      id: 'fire',
      name: 'Fire Alarm Systems',
      subcategories: [
        'Smoke Detectors',
        'Heat Detectors',
        'Manual Call Points',
        'Control Panels'
      ]
    }
  ];

  const priceRanges = [
    { id: 'all', label: 'All Prices' },
    { id: '0-5000', label: '₹0 - ₹5,000' },
    { id: '5000-10000', label: '₹5,000 - ₹10,000' },
    { id: '10000-25000', label: '₹10,000 - ₹25,000' },
    { id: '25000-50000', label: '₹25,000 - ₹50,000' },
    { id: '50000-100000', label: '₹50,000 - ₹1,00,000' },
    { id: '100000+', label: '₹1,00,000+' }
  ];

  const brands = ['HIKVISION', 'DAHUA', 'UNIVIEW', 'SUNELL', 'AXIS', 'BOSCH'];

  const ipCameraResolutions = [
    { id: '2mp', label: '2 MP IP Camera', description: 'Budget-friendly, basic surveillance' },
    { id: '4mp', label: '4 MP IP Camera', description: 'Balanced clarity & performance' },
    { id: '6mp', label: '6 MP IP Camera', description: 'High-definition professional monitoring' }
  ];

  const nvrChannels = [
    { id: '4ch', label: '4 Channel NVR' },
    { id: '8ch', label: '8 Channel NVR' },
    { id: '16ch', label: '16 Channel NVR' },
    { id: '32ch', label: '32 Channel NVR' }
  ];

  const poeSwitches = [
    { id: '4port', label: '4 Port POE' },
    { id: '8port', label: '8 Port POE' },
    { id: '16port', label: '16 Port POE' }
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
    if (newBrands.has(brand)) {
      newBrands.delete(brand);
    } else {
      newBrands.add(brand);
    }
    setSelectedBrands(newBrands);
    if (onCategorySelect) {
      onCategorySelect(brand);
    }
  };

  const handleClearFilters = () => {
    setExpandedCategory(null);
    setSelectedPrice('all');
    setSelectedBrands(new Set());
    setSelectedCategories(new Set());
    setSelectedIPCameraResolution(new Set());
    setSelectedNVRChannels(new Set());
    setSelectedPOESwitch(new Set());
  };

  const handleIPCameraResolutionChange = (resolution) => {
    const newResolutions = new Set(selectedIPCameraResolution);
    if (newResolutions.has(resolution)) {
      newResolutions.delete(resolution);
    } else {
      newResolutions.add(resolution);
    }
    setSelectedIPCameraResolution(newResolutions);
    if (onIPCameraResolutionChange) {
      onIPCameraResolutionChange(newResolutions);
    }
  };

  const handleNVRChannelChange = (channel) => {
    const newChannels = new Set(selectedNVRChannels);
    if (newChannels.has(channel)) {
      newChannels.delete(channel);
    } else {
      newChannels.add(channel);
    }
    setSelectedNVRChannels(newChannels);
    if (onNVRChannelChange) {
      onNVRChannelChange(newChannels);
    }
  };

  const handlePOESwitchChange = (poeSwitch) => {
    const newSwitches = new Set(selectedPOESwitch);
    if (newSwitches.has(poeSwitch)) {
      newSwitches.delete(poeSwitch);
    } else {
      newSwitches.add(poeSwitch);
    }
    setSelectedPOESwitch(newSwitches);
    if (onPOESwitchChange) {
      onPOESwitchChange(newSwitches);
    }
  };

  return (
    <div className="category-sidebar">
      {/* Category Filter */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Categories</div>
        <div className="categories-list">
          {categories.map((category) => (
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
                      key={subcategory}
                      className="subcategory-item"
                    >
                      <input
                        type="checkbox"
                        id={`category-${subcategory}`}
                        className="subcategory-checkbox"
                        checked={selectedCategories.has(subcategory)}
                        onChange={() => {
                          const newCategories = new Set(selectedCategories);
                          if (newCategories.has(subcategory)) {
                            newCategories.delete(subcategory);
                          } else {
                            newCategories.add(subcategory);
                          }
                          setSelectedCategories(newCategories);
                          if (onCategorySelect) {
                            onCategorySelect(subcategory);
                          }
                        }}
                      />
                      <label htmlFor={`category-${subcategory}`} style={{ cursor: 'pointer' }}>
                        {subcategory}
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

      {/* Rating Filter */}
      <div className="sidebar-section" style={{ display: 'none' }}>
        <div className="sidebar-section-title">Rating</div>
        <div className="rating-list">
          {[4.5, 4, 3.5, 3].map((rating) => (
            <div key={rating} className="rating-item">
              <input
                type="checkbox"
                id={`rating-${rating}`}
                className="rating-checkbox"
                onChange={() => {}}
              />
              <label htmlFor={`rating-${rating}`} className="rating-label">
                {rating}★ & above
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* IP Camera Resolution Filter */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">IP Camera Resolution</div>
        <div className="specifications-list">
          {ipCameraResolutions.map((resolution) => (
            <div key={resolution.id} className="specification-item">
              <input
                type="checkbox"
                id={`resolution-${resolution.id}`}
                className="specification-checkbox"
                checked={selectedIPCameraResolution.has(resolution.id)}
                onChange={() => handleIPCameraResolutionChange(resolution.id)}
              />
              <div style={{ flex: 1 }}>
                <label htmlFor={`resolution-${resolution.id}`} className="specification-label">
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

      {/* NVR Channels Filter */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">NVR Channel Options</div>
        <div className="specifications-list">
          {nvrChannels.map((channel) => (
            <div key={channel.id} className="specification-item">
              <input
                type="checkbox"
                id={`nvr-${channel.id}`}
                className="specification-checkbox"
                checked={selectedNVRChannels.has(channel.id)}
                onChange={() => handleNVRChannelChange(channel.id)}
              />
              <label htmlFor={`nvr-${channel.id}`} className="specification-label">
                {channel.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* POE Switch Filter */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">POE Switch Options</div>
        <div className="specifications-list">
          {poeSwitches.map((poeSwitch) => (
            <div key={poeSwitch.id} className="specification-item">
              <input
                type="checkbox"
                id={`poe-${poeSwitch.id}`}
                className="specification-checkbox"
                checked={selectedPOESwitch.has(poeSwitch.id)}
                onChange={() => handlePOESwitchChange(poeSwitch.id)}
              />
              <label htmlFor={`poe-${poeSwitch.id}`} className="specification-label">
                {poeSwitch.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      <button className="clear-filters-btn" onClick={handleClearFilters}>Clear All Filters</button>
    </div>
  );
};

export default CategorySidebar;
