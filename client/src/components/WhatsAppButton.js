import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import '../styles/WhatsAppButton.css';

const WhatsAppButton = () => {
  const phoneNumber = '919455304151'; // India country code (91) + number
  const message = 'Hello! I would like to know more about your products and services.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const handleWhatsAppClick = () => {
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button 
      className="whatsapp-button" 
      onClick={handleWhatsAppClick}
      title="Chat with us on WhatsApp"
      aria-label="WhatsApp Chat"
    >
      <FaWhatsapp />
    </button>
  );
};

export default WhatsAppButton;
