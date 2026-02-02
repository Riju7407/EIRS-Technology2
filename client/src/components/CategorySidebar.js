import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import { useCategoryFilter } from '../context/CategoryFilterContext';
import '../styles/CategorySidebar.css';

// Category Sidebar with hierarchical menu
const CategorySidebar = ({ 
  onCategorySelect = () => {}, 
  onPriceRangeChange = () => {}
}) => {
  const navigate = useNavigate();
  const { categories = [], subcategories = [], filters = {}, loading } = useCategoryFilter();
  
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
  const [clickedCategory, setClickedCategory] = useState(null);

  // Main categories structure with detailed subcategories
  const mainCategories = [
    {
      id: 'cctv',
      name: 'CCTV Cameras',
      subcategories: [
        {
          name: 'IP Camera',
          submenus: [
            {
              name: 'Camera',
              items: ['2 MP IP Camera', '4 MP IP Camera', '6 MP IP Camera']
            },
            {
              name: 'NVR',
              items: ['4 CH', '8 CH', '16 CH', '22 CH']
            },
            {
              name: 'POE',
              items: ['4 CH', '8 CH', '16 CH']
            }
          ]
        },
        {
          name: 'HD Camera',
          submenus: [
            {
              name: 'Camera',
              items: ['2 MP', '4 MP', '6 MP']
            },
            {
              name: 'SMPS',
              items: ['4 CH', '8 CH', '16 CH']
            },
            {
              name: 'DVR',
              items: ['4 CH', '8 CH', '16 CH', '32 CH']
            }
          ]
        },
        {
          name: 'Wi-Fi/4G Camera',
          redirect: true
        },
        {
          name: 'CCTV Bundle Pack',
          redirect: true
        }
      ]
    },
    {
      id: 'biometric',
      name: 'Biometric Devices',
      redirect: true
    },
    {
      id: 'intercom',
      name: 'Intercom System',
      subcategories: [
        {
          name: 'EPBX',
          redirect: true
        },
        {
          name: 'IPBX',
          redirect: true
        }
      ]
    },
    {
      id: 'home-office',
      name: 'Home & Office Security',
      redirect: true
    },
    {
      id: 'fire',
      name: 'Fire Alarm Systems',
      redirect: true
    }
  ];

  const handleCategoryClick = (categoryName) => {
    console.log('🔗 Navigating to category:', categoryName);
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  const handleSubcategoryClick = (categoryName, subcategoryName) => {
    console.log('🔗 Navigating to:', categoryName, '>', subcategoryName);
    navigate(`/products?category=${encodeURIComponent(categoryName)}&subcategory=${encodeURIComponent(subcategoryName)}`);
  };

  const handleLeafItemClick = (categoryName, subcategoryName, itemName) => {
    console.log('🔗 Navigating to:', categoryName, '>', subcategoryName, '>', itemName);
    navigate(`/products?category=${encodeURIComponent(categoryName)}&search=${encodeURIComponent(itemName)}`);
  };

  return (
    <div className="category-sidebar-hierarchical">
      <h3 className="sidebar-title">Categories</h3>
      
      <div className="hierarchical-menu">
        {mainCategories.map((category) => (
          <div
            key={category.id}
            className="menu-item-main"
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => {
              setHoveredCategory(null);
              setHoveredSubcategory(null);
            }}
          >
            <div 
              className="menu-item-label"
              onClick={() => {
                if (!category.subcategories) {
                  handleCategoryClick(category.name);
                } else {
                  // Toggle clicked state for categories with subcategories
                  setClickedCategory(clickedCategory === category.id ? null : category.id);
                }
              }}
            >
              <span>{category.name}</span>
              {category.subcategories && <FaChevronRight className="chevron-icon" />}
            </div>

            {/* First level submenu - show on hover OR click */}
            {(hoveredCategory === category.id || clickedCategory === category.id) && category.subcategories && (
              <div className="submenu-level-1">
                {category.subcategories.map((sub, idx) => (
                  <div
                    key={idx}
                    className="menu-item-sub"
                    onMouseEnter={() => setHoveredSubcategory(idx)}
                    onMouseLeave={() => setHoveredSubcategory(null)}
                  >
                    <div
                      className="menu-item-label"
                      onClick={() => sub.redirect && handleSubcategoryClick(category.name, sub.name)}
                    >
                      <span>{sub.name}</span>
                      {sub.submenus && <FaChevronRight className="chevron-icon" />}
                    </div>

                    {/* Second level submenu */}
                    {hoveredSubcategory === idx && sub.submenus && (
                      <div className="submenu-level-2">
                        {sub.submenus.map((submenu, sidx) => (
                          <div key={sidx} className="menu-item-sub2">
                            <div className="menu-item-label">{submenu.name}</div>
                            
                            {/* Third level submenu */}
                            {submenu.items && (
                              <div className="submenu-level-3">
                                {submenu.items.map((item, iidx) => (
                                  <div
                                    key={iidx}
                                    className="menu-item-leaf"
                                    onClick={() => handleLeafItemClick(category.name, sub.name, item)}
                                  >
                                    {item}
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySidebar;
