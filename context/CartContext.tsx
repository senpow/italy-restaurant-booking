import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (itemName: string) => void;
    updateQuantity: (itemName: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item: Omit<CartItem, 'quantity'>) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(i => i.name === item.name);
            if (existingItem) {
                return prevCart.map(i =>
                    i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemName: string) => {
        setCart(prevCart => prevCart.filter(item => item.name !== itemName));
    };

    const updateQuantity = (itemName: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(itemName);
            return;
        }
        setCart(prevCart =>
            prevCart.map(item =>
                item.name === itemName ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((total, item) => {
        const price = parseFloat(item.price.replace(',', '.').replace(' €', ''));
        return total + price * item.quantity;
    }, 0);

    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};
