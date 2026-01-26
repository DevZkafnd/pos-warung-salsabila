import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, CartItem } from '@/types';
import { parsePrice } from '@/lib/utils';

interface CartState {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  decreaseQty: (productId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product) => set((state) => {
        const existingItem = state.items.find((item) => item.productId === product.id);
        const safePrice = parsePrice(product.price);
        
        if (existingItem) {
          return {
            items: state.items.map((item) =>
              item.productId === product.id
                ? { ...item, qty: item.qty + 1, price: safePrice } // Update price in case it changed
                : item
            ),
          };
        }
        return {
          items: [
            ...state.items,
            {
              productId: product.id,
              name: product.name,
              price: safePrice,
              qty: 1,
              image: product.image,
              category: product.category,
            },
          ],
        };
      }),
      removeFromCart: (productId) => set((state) => ({
        items: state.items.filter((item) => item.productId !== productId),
      })),
      decreaseQty: (productId) => set((state) => {
        const existingItem = state.items.find((item) => item.productId === productId);
        if (existingItem && existingItem.qty > 1) {
           return {
            items: state.items.map((item) =>
              item.productId === productId
                ? { ...item, qty: item.qty - 1 }
                : item
            ),
          };
        }
        // If qty is 1, remove it
        return {
          items: state.items.filter((item) => item.productId !== productId),
        };
      }),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.qty, 0);
      },
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.qty), 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
