"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../service/productService';

interface CartContextType {
  items: Product[];
  addToCart: (product: Omit<Product, 'quantity'>) => void;
  removeFromCart: (nft_address: string) => void;
  updateQuantity: (nft_address: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  isCartOpen: boolean;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart data from localStorage', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Omit<Product, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.nft_address === product.nft_address);
      
      if (existingItem) {
        return prevItems.map(item => 
          item.nft_address === product.nft_address 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (nft_address: string) => {
    setItems(prevItems => prevItems.filter(item => item.nft_address !== nft_address));
  };

  const updateQuantity = (nft_address: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(nft_address);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.nft_address === nft_address ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  // Calculate total price
  const cartTotal = items.reduce(
    (total, item) => total + (parseFloat(item.price) * item.quantity), 
    0
  );

  // Calculate total number of items
  const itemCount = items.reduce(
    (count, item) => count + item.quantity, 
    0
  );

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      itemCount,
      isCartOpen,
      toggleCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};