import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import { useCategoryFilter } from "../context/CategoryFilterContext";
import "../styles/CategorySidebar.css";
import axios from "axios";

const CategorySidebar = ({
  onCategorySelect = () => {},
  onPriceRangeChange = () => {},
}) => {
  const navigate = useNavigate();
  const { closeSidebar } = useCategoryFilter();

  const [mainCategories, setMainCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
  const [clickedCategory, setClickedCategory] = useState(null);
  const [clickedSubcategory, setClickedSubcategory] = useState(null);

  const API_ROOT = (
    process.env.REACT_APP_API_URL || "http://localhost:5000"
  ).replace(/\/$/, "");

  const API_BASE = `${API_ROOT}/api`;

  useEffect(() => {
    fetchSidebarCategories();
  }, []);

  const fetchSidebarCategories = async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        axios.get(`${API_BASE}/categories`),
        axios.get(`${API_BASE}/subcategories`),
      ]);

      console.log("CATEGORY RESPONSE:", catRes.data);
      console.log("SUBCATEGORY RESPONSE:", subRes.data);

      const categories = Array.isArray(catRes.data)
        ? catRes.data
        : catRes.data.data || [];

      const subcategories = Array.isArray(subRes.data)
        ? subRes.data
        : subRes.data.data || [];

      const formatted = categories.map((cat) => ({
        id: cat._id,
        name: cat.name,
        subcategories: subcategories
          .filter(
            (sub) =>
              String(
                typeof sub.category === "object"
                  ? sub.category?._id
                  : sub.category,
              ) === String(cat._id),
          )
          .map((sub) => ({
            name: sub.name,
            actualSubcategory: sub.name,
            redirect: true,
          })),
      }));

      console.log("FORMATTED SIDEBAR:", formatted);

      setMainCategories(formatted);
    } catch (error) {
      console.error("Sidebar Error:", error);
      setMainCategories([]);
    }
  };

  const handleCategoryClick = (categoryName) => {
    console.log("🔗 Navigating to category:", categoryName);
    navigate(
      `/products?category=${encodeURIComponent(categoryName)}&fromSidebar=true`,
    );
    closeSidebar();
  };

  const handleSubcategoryClick = (
    categoryName,
    subcategoryName,
    actualSubcategory = null,
  ) => {
    const subcatToUse = actualSubcategory || subcategoryName;

    console.log("🔗 Navigating to:", categoryName, ">", subcatToUse);

    navigate(
      `/products?category=${encodeURIComponent(
        categoryName,
      )}&subcategory=${encodeURIComponent(subcatToUse)}&fromSidebar=true`,
    );

    closeSidebar();
  };

  const handleLeafItemClick = (categoryName, subcategoryName, itemName) => {
    console.log(
      "🔗 Navigating to:",
      categoryName,
      ">",
      subcategoryName,
      ">",
      itemName,
    );

    navigate(
      `/products?category=${encodeURIComponent(
        categoryName,
      )}&subcategory=${encodeURIComponent(
        subcategoryName,
      )}&submenu=${encodeURIComponent(itemName)}`,
    );

    closeSidebar();
  };

  const handleSubmenuClick = (categoryName, subcategoryName, submenuName) => {
    console.log(
      "🔗 Navigating to submenu:",
      categoryName,
      ">",
      subcategoryName,
      ">",
      submenuName,
    );

    navigate(
      `/products?category=${encodeURIComponent(
        categoryName,
      )}&subcategory=${encodeURIComponent(
        subcategoryName,
      )}&submenu=${encodeURIComponent(submenuName)}&fromSidebar=true`,
    );

    closeSidebar();
  };

  return (
    <div className="category-sidebar-hierarchical">
      <h3 className="sidebar-title">Categories</h3>

      <div className="hierarchical-menu">
        {mainCategories.map((category) => (
          <div
            key={category.id}
            className={`menu-item-main ${
              category.id === "biometric" ? "break-line" : ""
            }`}
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => {
              setHoveredCategory(null);
              setHoveredSubcategory(null);
            }}
          >
            <div
              className="menu-item-label"
              onClick={() => {
                if (!category.subcategories?.length) {
                  handleCategoryClick(category.name);
                } else {
                  setClickedCategory(
                    clickedCategory === category.id ? null : category.id,
                  );
                }
              }}
            >
              <span>{category.name}</span>

              {category.subcategories?.length > 0 && (
                <FaChevronRight className="chevron-icon" />
              )}
            </div>

            {(hoveredCategory === category.id ||
              clickedCategory === category.id) &&
              category.subcategories && (
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
                            handleSubcategoryClick(
                              category.name,
                              sub.name,
                              sub.actualSubcategory,
                            );
                          } else {
                            setClickedSubcategory(
                              clickedSubcategory ===
                                `${category.id}-${sub.name}`
                                ? null
                                : `${category.id}-${sub.name}`,
                            );
                          }
                        }}
                      >
                        <span>{sub.name}</span>

                        {sub.submenus && (
                          <FaChevronRight className="chevron-icon" />
                        )}
                      </div>

                      {(hoveredSubcategory === sub.name ||
                        clickedSubcategory === `${category.id}-${sub.name}`) &&
                        sub.submenus && (
                          <div className="submenu-level-2">
                            {sub.submenus.map((submenu) => (
                              <div
                                key={`${category.id}-${sub.name}-${submenu.name}`}
                                className="menu-item-sub2"
                              >
                                <div
                                  className="menu-item-label"
                                  onClick={() =>
                                    handleSubmenuClick(
                                      category.name,
                                      sub.name,
                                      submenu.name,
                                    )
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  {submenu.name}
                                </div>

                                {submenu.items && (
                                  <div className="submenu-level-3">
                                    {submenu.items.map((item) => (
                                      <div
                                        key={`${category.id}-${sub.name}-${submenu.name}-${item}`}
                                        className="menu-item-leaf"
                                        onClick={() =>
                                          handleLeafItemClick(
                                            category.name,
                                            sub.name,
                                            item,
                                          )
                                        }
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
