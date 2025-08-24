"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '@/types/product';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, selectedColor?: string) => void;
  removeFromCart: (productId: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string) => void;
  updateColor: (productId: string, oldColor: string, newColor: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemKey: (productId: string, color?: string) => string;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  updateColor: () => {},
  clearCart: () => {},
  getCartTotal: () => 0,
  getCartItemKey: () => '',
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const getCartItemKey = (productId: string, color?: string) => {
    return `${productId}-${color || 'default'}`;
  };

  const addToCart = (product: Product, quantity: number, selectedColor?: string) => {
    setCart(prevCart => {
      const itemKey = getCartItemKey(product.id, selectedColor);
      const existingItem = prevCart.find(item => 
        getCartItemKey(item.product.id, item.selectedColor) === itemKey
      );
      const maxQty = product.quantity;
      if (existingItem) {
        const newQty = Math.min(existingItem.quantity + quantity, maxQty);
        return prevCart.map(item => 
          getCartItemKey(item.product.id, item.selectedColor) === itemKey
            ? { ...item, quantity: newQty } 
            : item
        );
      } else {
        return [...prevCart, { product, quantity: Math.min(quantity, maxQty), selectedColor }];
      }
    });
  };

  const removeFromCart = (productId: string, selectedColor?: string) => {
    setCart(prevCart => {
      const itemKey = getCartItemKey(productId, selectedColor);
      return prevCart.filter(item => 
        getCartItemKey(item.product.id, item.selectedColor) !== itemKey
      );
    });
  };

  const updateQuantity = (productId: string, quantity: number, selectedColor?: string) => {
    if (quantity < 1) return;
    setCart(prevCart => {
      const itemKey = getCartItemKey(productId, selectedColor);
      return prevCart.map(item => {
        if (getCartItemKey(item.product.id, item.selectedColor) === itemKey) {
          const maxQty = item.product.quantity;
          return { ...item, quantity: Math.min(quantity, maxQty) };
        }
        return item;
      });
    });
  };

  const updateColor = (productId: string, oldColor: string, newColor: string) => {
    setCart(prevCart => {
      const oldItemKey = getCartItemKey(productId, oldColor);
      const newItemKey = getCartItemKey(productId, newColor);
      
      const existingNewItem = prevCart.find(item => 
        getCartItemKey(item.product.id, item.selectedColor) === newItemKey
      );

      if (existingNewItem) {
        return prevCart.map(item => {
          if (getCartItemKey(item.product.id, item.selectedColor) === newItemKey) {
            const oldItem = prevCart.find(item => 
              getCartItemKey(item.product.id, item.selectedColor) === oldItemKey
            );
            return { ...item, quantity: item.quantity + (oldItem?.quantity || 0) };
          }
          return item;
        }).filter(item => 
          getCartItemKey(item.product.id, item.selectedColor) !== oldItemKey
        );
      } else {
        return prevCart.map(item => 
          getCartItemKey(item.product.id, item.selectedColor) === oldItemKey
            ? { ...item, selectedColor: newColor } 
            : item
        );
      }
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product.price;
      
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        updateColor,
        clearCart, 
        getCartTotal,
        getCartItemKey
      }}
    >
      {children}
    </CartContext.Provider>
  );
};