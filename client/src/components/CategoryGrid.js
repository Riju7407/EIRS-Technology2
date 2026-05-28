import React from 'react';
import { FaWifi, FaCamera, FaLightbulb, FaPhone, FaLock, FaRobot } from 'react-icons/fa';
import '../styles/CategoryGrid.css';



const fetchCategories = async () => {
  try {

    const response =
      await api.get('/categories');

    setCategories(
      response.data.data || []
    );

  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  fetchCategories();
}, []);

const CategoryGrid = () => {
  const [categories, setCategories] =
  useState([]);


  return (
    <section className="category-grid-section">
      <div className="container">
        <h2>Popular Categories</h2>
        <div className="category-grid">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <a key={category.id} href={`/products?category=${category._id}`} className="category-card">
                <div className="category-icon">
                  <Icon />
                </div>
                <h3>{category.name}</h3>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
