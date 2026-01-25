import React from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/GoogleMap.css';

const GoogleMap = () => {
  const location = useLocation();

  // Hide GoogleMap on admin pages
  if (location.pathname.startsWith('/admin/')) {
    return null;
  }

  return (
    <section className="google-map-section">
      <div className="map-container">
        <iframe
          title="EIRS Technology Location"
          className="google-map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.1234567890!2d-74.0060!3d40.7128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a23e6d30375%3A0xcbf6532050760cfc!2s123%20Tech%20Street%2C%20Tech%20City%2C%20TC%2012345!5e0!3m2!1sen!2sus!4v1234567890"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </section>
  );
};

export default GoogleMap;
