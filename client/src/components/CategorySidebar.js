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
  const { categories = [], subcategories = [], filters = {}, loading, closeSidebar } = useCategoryFilter();
  
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
  const [clickedCategory, setClickedCategory] = useState(null);
  const [clickedSubcategory, setClickedSubcategory] = useState(null);

  // Main categories structure with detailed subcategories
  const mainCategories = [
    {
      id: 'cctv',
      name: 'CCTV Cameras',
      subcategories: [
        {
          name: 'IP Camera Solutions',
          submenus: [
            {
              name: 'Camera'
            },
            {
              name: 'NVR'
            },
            {
              name: 'POE'
            }
          ]
        },
        {
          name: 'HD Camera (Analog CCTV)',
          submenus: [
            {
              name: 'Camera'
            },
            {
              name: 'SMPS'
            },
            {
              name: 'DVR'
            }
          ]
        },
        {
          name: 'Wi-Fi / 4G Camera',
          redirect: true
        },
        {
          name: 'CCTV Bundle Packs',
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
          displayName: 'EPBX',
          redirect: true,
          actualSubcategory: 'EPABX System'
        },
        {
          name: 'IPBX',
          displayName: 'IPBX',
          redirect: true,
          actualSubcategory: 'PBX System'
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
    navigate(`/products?category=${encodeURIComponent(categoryName)}&fromSidebar=true`);
    closeSidebar();
  };

  const handleSubcategoryClick = (categoryName, subcategoryName, actualSubcategory = null) => {
    const subcatToUse = actualSubcategory || subcategoryName;
    console.log('🔗 Navigating to:', categoryName, '>', subcatToUse);
    navigate(`/products?category=${encodeURIComponent(categoryName)}&subcategory=${encodeURIComponent(subcatToUse)}&fromSidebar=true`);
    closeSidebar();
  };

  const handleLeafItemClick = (categoryName, subcategoryName, itemName) => {
    console.log('🔗 Navigating to:', categoryName, '>', subcategoryName, '>', itemName);
    navigate(`/products?category=${encodeURIComponent(categoryName)}&subcategory=${encodeURIComponent(subcategoryName)}&submenu=${encodeURIComponent(itemName)}`);
    closeSidebar();
  };

  const handleSubmenuClick = (categoryName, subcategoryName, submenuName) => {
    console.log('🔗 Navigating to submenu:', categoryName, '>', subcategoryName, '>', submenuName);
    navigate(`/products?category=${encodeURIComponent(categoryName)}&subcategory=${encodeURIComponent(subcategoryName)}&submenu=${encodeURIComponent(submenuName)}&fromSidebar=true`);
    closeSidebar();
  };

  return (
    <div className="category-sidebar-hierarchical">
      <h3 className="sidebar-title">Categories</h3>
      
      <div className="hierarchical-menu">
        {mainCategories.map((category) => (
          <div
            key={category.id}
            className={`menu-item-main ${category.id === 'biometric' ? 'break-line' : ''}`}
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
                      onClick={() => {
                        if (sub.redirect) {
                          handleSubcategoryClick(category.name, sub.name, sub.actualSubcategory);
                        } else {
                          // Toggle submenu on click if it has submenus
                          setClickedSubcategory(clickedSubcategory === `${category.id}-${idx}` ? null : `${category.id}-${idx}`);
                        }
                      }}
                    >
                      <span>{sub.name}</span>
                      {sub.submenus && <FaChevronRight className="chevron-icon" />}
                    </div>

                    {/* First level submenu - show on hover OR click */}
                    {(hoveredSubcategory === idx || clickedSubcategory === `${category.id}-${idx}`) && sub.submenus && (
                      <div className="submenu-level-2">
                        {sub.submenus.map((submenu, sidx) => (
                          <div key={sidx} className="menu-item-sub2">
                            <div 
                              className="menu-item-label"
                              onClick={() => handleSubmenuClick(category.name, sub.name, submenu.name)}
                              style={{ cursor: 'pointer' }}
                            >
                              {submenu.name}
                            </div>
                            
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
