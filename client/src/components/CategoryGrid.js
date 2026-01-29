import React from 'react';
import { FaWifi, FaCamera, FaLightbulb, FaPhone, FaLock, FaRobot } from 'react-icons/fa';
import '../styles/CategoryGrid.css';

const CategoryGrid = () => {
  const categories = [
    { id: 1, name: 'CCTV & Surveillance', icon: FaCamera, link: '/products?category=cctv' },
    { id: 2, name: 'Wireless Devices', icon: FaWifi, link: '/products?category=wireless' },
    { id: 3, name: 'IoT Solutions', icon: FaLightbulb, link: '/products?category=iot' },
    { id: 4, name: 'Intercom Systems', icon: FaPhone, link: '/products?category=intercom' },
    { id: 5, name: 'Security Systems', icon: FaLock, link: '/products?category=security' },
    { id: 6, name: 'Automation', icon: FaRobot, link: '/products?category=automation' },
    { id: 7, name: 'Networking', icon: FaWifi, link: '/products?category=networking' },
    { id: 8, name: 'Access Control', icon: FaLock, link: '/products?category=access' }
  ];

  return (
    <section className="category-grid-section">
      <div className="container">
        <h2>Popular Categories</h2>
        <div className="category-grid">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <a key={category.id} href={category.link} className="category-card">
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
