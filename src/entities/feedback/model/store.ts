import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface FeedbackImage {
  id: string;
  dataUrl: string;
  name: string;
}

interface FeedbackState {
  title: string;
  text: string;
  images: FeedbackImage[];
  setTitle: (title: string) => void;
  setText: (text: string) => void;
  addImage: (image: FeedbackImage) => void;
  removeImage: (id: string) => void;
  clearFeedback: () => void;
}

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set) => ({
      title: '',
      text: '',
      images: [],
      setTitle: (title) => set({ title }),
      setText: (text) => set({ text }),
      addImage: (image) => set((state) => ({ images: [...state.images, image] })),
      removeImage: (id) => set((state) => ({ images: state.images.filter((img) => img.id !== id) })),
      clearFeedback: () => set({ text: '', title: '', images: [] }),
    }),
    {
      name: 'feedback-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
