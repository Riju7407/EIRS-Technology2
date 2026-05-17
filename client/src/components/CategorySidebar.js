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
  const { closeSidebar } = useCategoryFilter();
  
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
    },
    {
      id: 'networking',
      name: 'Networking Device',
      subcategories: [
        {
          name: 'Routers',
          redirect: true
        },
        {
          name: 'Switches',
          redirect: true
        },
        {
          name: 'Access Points',
          redirect: true
        },
        {
          name: 'Patch Panels',
          redirect: true
        },
        {
          name: 'Network Cables & Accessories',
          redirect: true
        },
        {
          name: 'Modems',
          redirect: true
        }
      ]
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
                {category.subcategories.map((sub) => (
                  <div
                    key={`${category.id}-${sub.name}`}
                    className="menu-item-sub"
                    onMouseEnter={() => setHoveredSubcategory(sub.name)}
                    onMouseLeave={() => setHoveredSubcategory(null)}
                  >
                    <div
                      className="menu-item-label"
                      onClick={() => {
                        if (sub.redirect) {
                          handleSubcategoryClick(category.name, sub.name, sub.actualSubcategory);
                        } else {
                          // Toggle submenu on click if it has submenus
                          setClickedSubcategory(clickedSubcategory === `${category.id}-${sub.name}` ? null : `${category.id}-${sub.name}`);
                        }
                      }}
                    >
                      <span>{sub.name}</span>
                      {sub.submenus && <FaChevronRight className="chevron-icon" />}
                    </div>

                    {/* First level submenu - show on hover OR click */}
                    {(hoveredSubcategory === sub.name || clickedSubcategory === `${category.id}-${sub.name}`) && sub.submenus && (
                      <div className="submenu-level-2">
                        {sub.submenus.map((submenu) => (
                          <div key={`${category.id}-${sub.name}-${submenu.name}`} className="menu-item-sub2">
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
                                {submenu.items.map((item) => (
                                  <div
                                    key={`${category.id}-${sub.name}-${submenu.name}-${item}`}
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
