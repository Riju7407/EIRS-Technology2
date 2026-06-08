import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Use lazy initializer so reading localStorage happens synchronously on mount
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.filter((item) => item && item._id)
        : [];
    } catch (err) {
      console.error("Error parsing saved cart from localStorage:", err);
      return [];
    }
  });

  // Keep cart in sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "cart") {
        try {
          const next = e.newValue ? JSON.parse(e.newValue) : [];
          setCartItems(Array.isArray(next) ? next : []);
        } catch (err) {
          console.error("Error parsing cross-tab cart update:", err);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      if (!cartItems || cartItems.length === 0) {
        // store empty array explicitly
        localStorage.setItem("cart", JSON.stringify([]));
      } else {
        localStorage.setItem("cart", JSON.stringify(cartItems));
      }
    } catch (err) {
      console.error("Error saving cart to localStorage:", err);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);

     const cleanProduct = {
  _id: product._id,
  productName: product.productName || product.name,
  price: Number(product.price) || 0,
  quantity: Number(quantity) || 1,
  image: product.image || "",
  brand: product.brand || "",
  stock: Number(product.stock) || 0,
  category: product.category || "",
  discount: Number(product.discount) || 0,
  hsn: product.hsn || "",
  modelNo: product.modelNo || "",
};

      if (existingItem) {
       return prevItems.map((item) =>
  item._id === product._id
    ? {
        ...item,
        quantity:
          (Number(item.quantity) || 0) +
          (Number(quantity) || 1),

        productName: product.productName || item.productName,
        price: Number(product.price ?? item.price),
        discount: product.discount ?? item.discount,
        hsn: product.hsn ?? item.hsn,
        modelNo: product.modelNo ?? item.modelNo,
        image: product.image || item.image,
        brand: product.brand || item.brand,
        stock: Number(product.stock ?? item.stock) || 0,
      }
    : item
);
      } else {
        return [...prevItems, cleanProduct];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item._id !== productId),
    );
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item._id === productId ? { ...item, quantity } : item,
        ),
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

  const getDiscountedPrice = (item) => {
    const price = parseFloat(item.price) || 0;
    const discount = item.discount || 0;

    return price - (price * discount) / 100;
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      if (!item) return total;

      const finalPrice = getDiscountedPrice(item);

      return total + finalPrice * (item.quantity || 0);
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

        getDiscountedPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
