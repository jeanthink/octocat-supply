import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imgName: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (product: Omit<CartItem, 'quantity'>, quantity: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'octocat.cart.v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') { return []; }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota errors
    }
  }, [items]);

  const addItem: CartContextValue['addItem'] = (product, quantity) => {
    if (quantity <= 0) { return; }
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.productId ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity: CartContextValue['updateQuantity'] = (productId, quantity) => {
    setItems((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: Math.max(0, quantity) } : i))
        .filter((i) => i.quantity > 0),
    );
  };

  const removeItem: CartContextValue['removeItem'] = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clear: CartContextValue['clear'] = () => setItems([]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, total, addItem, updateQuantity, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) { throw new Error('useCart must be used within CartProvider'); }
  return ctx;
}
