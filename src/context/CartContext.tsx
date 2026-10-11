import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem, FoodVariant, FoodAddon, CartItem, DeliveryZone, Coupon } from '../types/index.ts';
import { api } from '../services/api.ts';

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    food: FoodItem,
    quantity?: number,
    selectedVariant?: FoodVariant,
    selectedAddons?: FoodAddon[],
    notes?: string
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  subtotal: number;
  deliveryZones: DeliveryZone[];
  selectedZone: DeliveryZone | null;
  setSelectedZone: (zone: DeliveryZone) => void;
  deliveryCharge: number;
  appliedCoupon: { code: string; discount: number; message: string } | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  total: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ghorer_shad_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; message: string } | null>(null);

  // Load delivery zones
  useEffect(() => {
    api.getDeliveryZones().then(zones => {
      setDeliveryZones(zones);
      if (zones.length > 0 && !selectedZone) {
        setSelectedZone(zones[0]);
      }
    }).catch(console.error);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ghorer_shad_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  const addToCart = (
    food: FoodItem,
    quantity = 1,
    selectedVariant?: FoodVariant,
    selectedAddons: FoodAddon[] = [],
    notes?: string
  ) => {
    const basePrice = food.salePrice !== undefined ? food.salePrice : food.price;
    const variantExtra = selectedVariant?.additionalPrice || 0;
    const addonsExtra = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = basePrice + variantExtra + addonsExtra;

    const cartItemId = `${food.id}-${selectedVariant?.id || 'none'}-${selectedAddons.map(a => a.id).sort().join('_')}`;

    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity: item.quantity + quantity,
                itemTotal: (item.quantity + quantity) * unitPrice
              }
            : item
        );
      } else {
        const newItem: CartItem = {
          cartItemId,
          foodId: food.id,
          food,
          quantity,
          selectedVariant,
          selectedAddons,
          specialNotes: notes,
          unitPrice,
          itemTotal: quantity * unitPrice
        };
        return [...prev, newItem];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              itemTotal: newQty * item.unitPrice
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);

  // Delivery charge calculation
  let deliveryCharge = 0;
  if (selectedZone) {
    if (subtotal >= selectedZone.freeDeliveryThreshold && subtotal > 0) {
      deliveryCharge = 0;
    } else if (subtotal > 0) {
      deliveryCharge = selectedZone.charge;
    }
  }

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!code.trim()) {
      return { success: false, message: 'কুপন কোড প্রবেশ করান।' };
    }
    try {
      const res = await api.validateCoupon(code.trim(), subtotal);
      if (res.valid) {
        setAppliedCoupon({
          code: code.trim().toUpperCase(),
          discount: res.discount,
          message: res.message
        });
        return { success: true, message: res.message };
      } else {
        return { success: false, message: res.message };
      }
    } catch {
      return { success: false, message: 'কুপন যাচাই করতে সমস্যা হয়েছে।' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryCharge);
  const totalItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        subtotal,
        deliveryZones,
        selectedZone,
        setSelectedZone,
        deliveryCharge,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        total,
        totalItemsCount
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
