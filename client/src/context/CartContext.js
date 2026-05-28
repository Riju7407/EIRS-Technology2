import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Use lazy initializer so reading localStorage happens synchronously on mount
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
  ? parsed.filter(item => item && item._id)
  : [];
    } catch (err) {
      console.error('Error parsing saved cart from localStorage:', err);
      return [];
    }
  });

  // Keep cart in sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'cart') {
        try {
          const next = e.newValue ? JSON.parse(e.newValue) : [];
          setCartItems(Array.isArray(next) ? next : []);
        } catch (err) {
          console.error('Error parsing cross-tab cart update:', err);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      if (!cartItems || cartItems.length === 0) {
        // store empty array explicitly
        localStorage.setItem('cart', JSON.stringify([]));
      } else {
        localStorage.setItem('cart', JSON.stringify(cartItems));
      }
    } catch (err) {
      console.error('Error saving cart to localStorage:', err);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item._id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

 const getTotalItems = () => {
  return cartItems.reduce((total, item) => {
    return total + (item?.quantity || 0);
  }, 0);
};

const getTotalPrice = () => {
  return cartItems.reduce((total, item) => {
    if (!item) return total;

    const price = parseFloat(item.price) || 0;

    return total + (price * (item.quantity || 0));
  }, 0);
};

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
