import { LOCAL_STORAGE_PREFIX } from '@lib/constants';
import create from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
    itemId: string;
    type: 'PLUGIN' | 'BUNDLE';
};

export type CartStoreType = {
    cartItems: CartItem[];
    addCartItem: (cartItem: CartItem) => void;
    removeCartItem: (cartItem: CartItem) => void;
    clearBundles(): void;
    clearCart: () => void;
};

const sessionKey = `${LOCAL_STORAGE_PREFIX}cart`;

export const useCartStore = create<CartStoreType>()(
    persist(
        (set, get) => ({
            cartItems: [],
            addCartItem: (cartItem: CartItem) => {
                const items = get().cartItems;
                if (
                    items.findIndex(item => {
                        return item.itemId === cartItem.itemId && item.type === cartItem.type;
                    }) !== -1
                ) {
                    return;
                }
                set(state => ({ cartItems: [...state.cartItems, cartItem] }));
            },
            clearBundles: () => {
                const items = get().cartItems;
                set({ cartItems: items.filter(item => item.type !== 'BUNDLE') });
            },
            removeCartItem: (cartItem: CartItem) =>
                set(state => ({ cartItems: state.cartItems.filter(item => item.itemId !== cartItem.itemId) })),
            clearCart: () => set({ cartItems: [] }),
        }),
        {
            name: sessionKey,
            getStorage: () => sessionStorage,
        }
    )
);
