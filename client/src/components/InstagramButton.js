import React from 'react';
import { FaInstagram } from 'react-icons/fa';
import '../styles/InstagramButton.css';

const InstagramButton = () => {
  const instagramUrl = 'https://www.instagram.com/technologyeirs/'; // Technology EIRS Instagram
  const instagramHandle = '@technologyeirs'; // Technology EIRS Instagram handle

  const handleInstagramClick = () => {
    window.open(instagramUrl, '_blank');
  };

  return (
    <button 
      className="instagram-button" 
      onClick={handleInstagramClick}
      title={`Follow us on Instagram - ${instagramHandle}`}
      aria-label="Instagram"
    >
      <FaInstagram />
    </button>
  );
};

export default InstagramButton;
