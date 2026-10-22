"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

const storageKey = "nook-noida-cart";
const emptyCart: CartItem[] = [];
const CartContext = createContext<CartContextValue | null>(null);
const listeners = new Set<() => void>();
let cartItems = emptyCart;
let hasLoadedCart = false;

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.image === "string" &&
    typeof item.quantity === "number"
  );
}

function readSavedCart(): CartItem[] {
  try {
    const savedCart = localStorage.getItem(storageKey);
    if (!savedCart) {
      return emptyCart;
    }

    const parsed: unknown = JSON.parse(savedCart);
    if (!Array.isArray(parsed) || !parsed.every(isCartItem)) {
      throw new Error("Saved cart data has an unexpected format.");
    }
    return parsed;
  } catch (error) {
    console.error("Could not load the saved cart.", error);
    return emptyCart;
  }
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (!hasLoadedCart) {
    cartItems = readSavedCart();
    hasLoadedCart = true;
    listener();
  }

  function handleStorageChange(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) {
      cartItems = readSavedCart();
      notifyListeners();
    }
  }

  window.addEventListener("storage", handleStorageChange);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorageChange);
  };
}

function getSnapshot() {
  return cartItems;
}

function updateCart(nextItems: CartItem[]) {
  cartItems = nextItems;
  try {
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  } catch (error) {
    console.error("Could not save the cart on this device.", error);
  }
  notifyListeners();
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, () => emptyCart);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    const existing = cartItems.find((cartItem) => cartItem.id === item.id);
    const nextItems = existing
      ? cartItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        )
      : [...cartItems, { ...item, quantity: 1 }];
    updateCart(nextItems);
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    updateCart(
      quantity < 1
        ? cartItems.filter((item) => item.id !== id)
        : cartItems.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    updateCart(cartItems.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => updateCart([]), []);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
    }),
    [items, addToCart, setQuantity, removeFromCart, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return context;
}
