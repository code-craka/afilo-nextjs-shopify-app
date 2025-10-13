'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { fireSuccessConfetti } from '@/lib/confetti';

/**
 * Simplified Cart Store with Database Sync
 *
 * Integrates with:
 * - PostgreSQL cart_items table
 * - Clerk authentication
 * - Shopify products
 * - Stripe checkout
 */

export type LicenseType = 'personal' | 'commercial';

export interface CartItem {
  id: string; // Database UUID
  productId: string; // Shopify product ID
  variantId: string; // Shopify variant ID
  title: string;
  price: number;
  quantity: number;
  licenseType: LicenseType;
  imageUrl?: string;
  addedAt: Date;
}

interface CartState {
  // State
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;

  // Actions - Cart Management
  addItem: (item: Omit<CartItem, 'id' | 'addedAt'>) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  updateLicenseType: (itemId: string, licenseType: LicenseType) => Promise<void>;
  clearCart: () => Promise<void>;

  // Actions - UI
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Actions - Sync
  syncWithServer: () => Promise<void>;
  loadFromServer: () => Promise<void>;

  // Computed
  itemCount: () => number;
  subtotal: () => number;
}

// API helper functions
async function apiCall(endpoint: string, method: string = 'GET', body?: any) {
  const response = await fetch(`/api/cart${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isOpen: false,
      isLoading: false,
      isSyncing: false,
      lastSyncedAt: null,

      // Add item to cart
      addItem: async (itemData) => {
        set({ isLoading: true });

        try {
          // Check if item already exists
          const existingItem = get().items.find(
            item =>
              item.productId === itemData.productId &&
              item.variantId === itemData.variantId &&
              item.licenseType === itemData.licenseType
          );

          if (existingItem) {
            // Update quantity instead
            await get().updateQuantity(
              existingItem.id,
              existingItem.quantity + itemData.quantity
            );
            toast.success(`Updated ${itemData.title} quantity`);
            return;
          }

          // Add to server
          const result = await apiCall('/items', 'POST', itemData);

          // Add to local state
          const newItem: CartItem = {
            id: result.id,
            ...itemData,
            addedAt: new Date(result.addedAt),
          };

          set(state => ({
            items: [...state.items, newItem],
            isLoading: false,
          }));

          // Success feedback
          toast.success(`Added ${itemData.title} to cart!`);
          fireSuccessConfetti();

          // Auto-open cart on add
          get().openCart();

        } catch (error) {
          console.error('Failed to add item:', error);
          toast.error('Failed to add item to cart');
          set({ isLoading: false });
          throw error;
        }
      },

      // Remove item from cart
      removeItem: async (itemId) => {
        set({ isLoading: true });

        try {
          // Remove from server
          await apiCall(`/items/${itemId}`, 'DELETE');

          // Remove from local state
          set(state => ({
            items: state.items.filter(item => item.id !== itemId),
            isLoading: false,
          }));

          toast.success('Removed from cart');
        } catch (error) {
          console.error('Failed to remove item:', error);
          toast.error('Failed to remove item');
          set({ isLoading: false });
          throw error;
        }
      },

      // Update item quantity
      updateQuantity: async (itemId, quantity) => {
        if (quantity < 1) {
          await get().removeItem(itemId);
          return;
        }

        set({ isLoading: true });

        try {
          // Update on server
          await apiCall(`/items/${itemId}`, 'PATCH', { quantity });

          // Update local state
          set(state => ({
            items: state.items.map(item =>
              item.id === itemId ? { ...item, quantity } : item
            ),
            isLoading: false,
          }));
        } catch (error) {
          console.error('Failed to update quantity:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Update license type
      updateLicenseType: async (itemId, licenseType) => {
        set({ isLoading: true });

        try {
          // Update on server
          await apiCall(`/items/${itemId}`, 'PATCH', { licenseType });

          // Update local state
          set(state => ({
            items: state.items.map(item =>
              item.id === itemId ? { ...item, licenseType } : item
            ),
            isLoading: false,
          }));
        } catch (error) {
          console.error('Failed to update license type:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Clear cart
      clearCart: async () => {
        set({ isLoading: true });

        try {
          // Clear on server
          await apiCall('/clear', 'POST');

          // Clear local state
          set({
            items: [],
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to clear cart:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Open cart slideout
      openCart: () => set({ isOpen: true }),

      // Close cart slideout
      closeCart: () => set({ isOpen: false }),

      // Toggle cart slideout
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),

      // Sync with server (debounced, called periodically)
      syncWithServer: async () => {
        const state = get();
        if (state.isSyncing) return;

        set({ isSyncing: true });

        try {
          // Get local item IDs
          const localItemIds = state.items.map(item => item.id);

          // Sync with server
          const result = await apiCall('/sync', 'POST', {
            localItems: localItemIds,
          });

          // Update local state with server items
          set({
            items: result.items.map((item: any) => ({
              ...item,
              addedAt: new Date(item.addedAt),
            })),
            lastSyncedAt: new Date(),
            isSyncing: false,
          });
        } catch (error) {
          console.error('Failed to sync with server:', error);
          set({ isSyncing: false });
        }
      },

      // Load cart from server (on app start)
      loadFromServer: async () => {
        set({ isLoading: true });

        try {
          const result = await apiCall('/items', 'GET');

          set({
            items: result.items.map((item: any) => ({
              ...item,
              addedAt: new Date(item.addedAt),
            })),
            lastSyncedAt: new Date(),
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to load cart:', error);
          set({ isLoading: false });
        }
      },

      // Get total item count
      itemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // Calculate subtotal
      subtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'afilo-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

// Auto-sync with server every 30 seconds when cart has items
if (typeof window !== 'undefined') {
  setInterval(() => {
    const state = useCartStore.getState();
    if (state.items.length > 0 && !state.isSyncing) {
      state.syncWithServer().catch(console.error);
    }
  }, 30000); // 30 seconds
}
