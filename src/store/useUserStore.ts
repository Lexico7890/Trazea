// store/useUserStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Role {
  id: string;
  name: string;
  permissions: Record<string, boolean>;
}

interface Location {
  id: number;
  name: string;
  type: string;
  city: string;
  address: string;
  role: Role;
  is_active: boolean;
  joined_at: string;
}

interface UserData {
  id: string;
  email: string;
  locations?: Location[];
}

interface SessionData {
  user: UserData;
  locations: Location[];
}

interface UserStore {
  sessionData: SessionData | null;
  currentLocation: Location | null;
  isAuthenticated: boolean;
  
  setSessionData: (data: SessionData | null) => void;
  setCurrentLocation: (location: Location | null) => void;
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
        
        // Auto-seleccionar primera tienda si existe
        if (data?.locations && data.locations.length > 0 && !get().currentLocation) {
          set({ currentLocation: data.locations[0] });
        }
      },
      
      setCurrentLocation: (location) => set({ currentLocation: location }),
      
      clearUser: () => set({ 
        sessionData: null, 
        currentLocation: null,
        isAuthenticated: false 
      }),
      
      hasPermission: (permission: string) => {
        const state = get();
        const permissions = state.currentLocation?.role?.permissions;
        return permissions?.[permission] === true || permissions?.all === true;
      },
      
      hasRole: (roleName: string) => {
        const state = get();
        return state.currentLocation?.role?.name === roleName;
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);