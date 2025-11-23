// store/useUserStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Role {
  id_rol: string;
  nombre: string;
  descripcion: string;
  permissions: {};
}

interface Location {
  id_localizacion: number;
  nombre: string;
}

interface UserData {
  id: string;
  email: string;
  role: Role;
  locations?: Location[];
}

interface SessionData {
  user: UserData;
  locations: Location[] | null;
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
      
      hasPermission: () => {
        const state = get();
        const permissions = state.sessionData?.user.role?.permissions;
        return permissions === true
      },
      
      hasRole: (roleName: string) => {
        const state = get();
        return state.sessionData?.user.role?.nombre === roleName;
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);