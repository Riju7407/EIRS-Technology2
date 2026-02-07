import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from './firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAdmin(userData.isAdmin || false);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);
  function setupRecaptchaVerifier(phoneNumber) {
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'normal' });
    recaptchaVerifier.render();
    signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
      .then((confirmationResult) => {
        // SMS sent. Prompt user to type the code from the message, then sign the user in with confirmationResult.confirm(code).
        window.confirmationResult = confirmationResult;
        console.log('OTP sent successfully');
      }).catch((error) => {
        console.error('Error during phone number sign-in:', error);
      });
  }
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAdmin(userData.isAdmin || false);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setIsAdmin(false);
  };

  const value = {
    isLoggedIn,
    user,
    isAdmin,
    loading,
    login,
    logout,
    setupRecaptchaVerifier,
    signInWithPhoneNumber
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
