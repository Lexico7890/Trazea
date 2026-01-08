import { create } from 'zustand';
import type { RecordsStore } from './types';

export const useRecordsStore = create<RecordsStore>((set) => ({
    movementToEdit: null,
    setMovementToEdit: (movement) => set({ movementToEdit: movement }),
}));
