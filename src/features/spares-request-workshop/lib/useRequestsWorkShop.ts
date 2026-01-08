import { create } from 'zustand';
import { toast } from 'sonner';
import type { RequestsState } from '../model/types';
import { addCartItem, bulkRemoveCartItems, getCartItems, removeCartItem } from '../api';



export const useRequestsStore = create<RequestsState>((set, get) => ({
    cartItems: [],
    destinations: [],
    isLoading: false,

    setDestinations: (destinations) => set({ destinations }),

    loadCart: async (locationId: string) => {
        set({ isLoading: true });
        try {
            const items = await getCartItems(locationId);
            set({ cartItems: items });
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar el carrito de solicitudes');
        } finally {
            set({ isLoading: false });
        }
    },

    addItemToCart: async (userId: string, locationId: string, repuestoId: string, quantity = 1) => {
        set({ isLoading: true });
        try {
            await addCartItem(userId, locationId, repuestoId, quantity);
            // We assume the component will reload the cart or we can optimistically update
            // But since it's a shared cart, reloading is safer to see others' changes too
            await get().loadCart(locationId);
        } catch (error) {
            console.error(error);
            toast.error('Error al agregar al carrito');
        } finally {
            set({ isLoading: false });
        }
    },

    removeItemFromCart: async (cartItemId: string) => {
        set({ isLoading: true });
        try {
            await removeCartItem(cartItemId);
            set((state) => ({
                cartItems: state.cartItems.filter((i) => i.id_item_carrito !== cartItemId),
            }));
            toast.success('Item eliminado del carrito');
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar del carrito');
        } finally {
            set({ isLoading: false });
        }
    },

    clearCartAfterSubmit: async (cartItemIds: string[]) => {
        set({ isLoading: true });
        try {
            await bulkRemoveCartItems(cartItemIds);
            set((state) => ({
                cartItems: state.cartItems.filter((i) => !cartItemIds.includes(i.id_item_carrito)),
            }));
        } catch (error) {
            console.error(error);
            // Even if delete fails, the request was created. We just warn.
            toast.warning('Solicitud creada, pero hubo un error al limpiar el carrito.');
        } finally {
            set({ isLoading: false });
        }
    },
}));
