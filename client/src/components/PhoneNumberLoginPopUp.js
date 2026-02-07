import React from 'react';
import { FaTimes, FaPhone } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/ServicesPopup.css';

const PhoneNumberLoginPopUp = ({ onClose }) => {
  return (
    <div className="services-popup-overlay">
      <div className="services-popup-container">
        <button className="popup-close-btn" onClick={onClose} title="Close">
          <FaTimes size={24} />
        </button>

        <div style={styles.popupContent}>
          <div style={styles.iconContainer}>
            <FaPhone size={48} style={styles.phoneIcon} />
          </div>
          
          <h2 style={styles.title}>Welcome to EIRS Technology</h2>
          <p style={styles.subtitle}>Sign in with your phone number to continue</p>
          
          <div style={styles.buttonContainer}>
            <Link to="/phonesignup" style={styles.link} onClick={onClose}>
              <button style={styles.primaryButton}>
                Sign In with Phone Number
              </button>
            </Link>
          </div>

          <div style={styles.divider}>
            <span>or</span>
          </div>

          <p style={styles.alternateText}>You can also sign in using email:</p>
          <Link to="/signin" style={styles.link} onClick={onClose}>
            <button style={styles.secondaryButton}>
              Sign In with Email
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  popupContent: {
    padding: '40px 30px',
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: '20px',
  },
  phoneIcon: {
    color: '#ff6b35',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '30px',
  },
  buttonContainer: {
    marginBottom: '20px',
  },
  link: {
    textDecoration: 'none',
    display: 'block',
  },
  primaryButton: {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: '#ff6b35',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  secondaryButton: {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: '#f0f0f0',
    color: '#333',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  divider: {
    margin: '25px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alternateText: {
    fontSize: '13px',
    color: '#999',
    marginBottom: '15px',
  },
};

export default PhoneNumberLoginPopUp;
