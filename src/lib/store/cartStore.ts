import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Prisma } from '@prisma/client';

export type CartItem = {
  productId: string;
  unitId: string;
  nameAr: string;
  matCode: string;
  unitName: string;
  unitRate: number;
  price: number;
  imageUrl: string;
  quantity: number;
};

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (unitId: string) => void;
  updateQuantity: (unitId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.unitId === newItem.unitId);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.unitId === newItem.unitId
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },
      
      removeItem: (unitId) => {
        set((state) => ({
          items: state.items.filter((item) => item.unitId !== unitId),
        }));
      },
      
      updateQuantity: (unitId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(unitId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.unitId === unitId ? { ...item, quantity } : item
          ),
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
    }),
    {
      name: 'shopay-cart-storage',
    }
  )
);
