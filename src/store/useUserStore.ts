// store/useUserStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserLocation } from '@/types/common-types';

interface Role {
  id_rol: string;
  nombre: string;
  descripcion: string;
  permissions: {};
}

interface UserData {
  id: string;
  email: string;
  role: Role;
  locations?: UserLocation[];
}

interface SessionData {
  user: UserData;
  locations: UserLocation[] | null;
}

interface UserStore {
  sessionData: SessionData | null;
  currentLocation: UserLocation | null;
  isAuthenticated: boolean;
  
  setSessionData: (data: SessionData | null) => void;
  setCurrentLocation: (location: UserLocation | null) => void;
  clearUser: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      sessionData: null,
      currentLocation: null,
      isAuthenticated: false,
      
      setSessionData: (data) => {
        set({ 
          sessionData: data, 
          isAuthenticated: !!data 
        });
      },
      
      setCurrentLocation: (location) => set({ currentLocation: location }),
      
      clearUser: () => set({ 
        sessionData: null, 
        currentLocation: null,
        isAuthenticated: false 
      }),
      
      hasPermission: () => {
        const state = get();
        const permissions = state.sessionData?.user.role?.permissions;
        return permissions === true
      },
      
      hasRole: (roleName: string) => {
        const state = get();
        const userRole = state.sessionData?.user.role?.nombre;
        if (!userRole) return false;
        return userRole.toLowerCase().trim() === roleName.toLowerCase().trim();
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);