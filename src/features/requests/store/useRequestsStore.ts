import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RequestItem {
  id: string; // id_repuesto
  nombre: string;
  referencia: string;
}

export interface Destination {
  id_localizacion: string;
  nombre: string;
  telefono: string;
}

interface RequestsStore {
  selectedItems: RequestItem[];
  destinations: Destination[];

  addItem: (item: RequestItem) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  setDestinations: (locations: Destination[]) => void;
}

export const useRequestsStore = create<RequestsStore>()(
  persist(
    (set, get) => ({
      selectedItems: [],
      destinations: [],

      addItem: (item) => {
        const { selectedItems } = get();
        const exists = selectedItems.some((i) => i.id === item.id);
        if (!exists) {
          set({ selectedItems: [...selectedItems, item] });
        }
      },

      removeItem: (id) => {
        const { selectedItems } = get();
        set({ selectedItems: selectedItems.filter((i) => i.id !== id) });
      },

      clearItems: () => {
        set({ selectedItems: [] });
      },

      setDestinations: (locations) => {
        set({ destinations: locations });
      },
    }),
    {
      name: 'requests-storage',
    }
  )
);
