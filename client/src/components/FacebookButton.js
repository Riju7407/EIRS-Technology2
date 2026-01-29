import React from 'react';
import { FaFacebook } from 'react-icons/fa';
import '../styles/FacebookButton.css';

const FacebookButton = () => {
  const facebookUrl = 'https://www.facebook.com/share/1ByAdwoeVx/'; // Technology EIRS Facebook

  const handleFacebookClick = () => {
    window.open(facebookUrl, '_blank');
  };

  return (
    <button 
      className="facebook-button" 
      onClick={handleFacebookClick}
      title="Follow us on Facebook"
      aria-label="Facebook"
    >
      <FaFacebook />
    </button>
  );
};

export default FacebookButton;
