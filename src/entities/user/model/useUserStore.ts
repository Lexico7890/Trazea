// store/useUserStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserLocation } from './types';

// Definición de permisos basada en la estructura proporcionada
export interface MenuPermissions {
  show_view: boolean;
  edit_register?: boolean;
  show_form_register?: boolean;
  get_action?: boolean;
  discontinue?: boolean;
  send_action?: boolean;
  button_actions?: boolean;
  create_register?: boolean;
  [key: string]: boolean | undefined;
}

export interface AppPermissions {
  menu: {
    registros: MenuPermissions;
    repuestos: MenuPermissions;
    solicitudes: MenuPermissions;
    inventario: MenuPermissions;
    [key: string]: MenuPermissions;
  };
  dashboard?: {
    view_global_stats: boolean;
    view_financial_data: boolean;
  };
  inventory?: {
    edit_product: boolean;
    create_product: boolean;
    delete_product: boolean;
    view_cost_price: boolean;
    view_all_locations: boolean;
    adjust_stock_manual: boolean;
    view_assigned_location_only: boolean;
  };
  logistics?: {
    reject_transfer: boolean;
    view_all_orders: boolean;
    approve_transfer_in: boolean;
    approve_transfer_out: boolean;
    create_transfer_order: boolean;
  };
  technical_ops?: {
    assign_to_tech: boolean;
    create_tech_user: boolean;
    receive_from_tech: boolean;
    view_tech_history: boolean;
  };
  users_and_access?: {
    create_user: boolean;
    edit_user_roles: boolean;
    view_audit_logs: boolean;
    assign_locations: boolean;
  };
  [key: string]: unknown;
}

interface Role {
  id_rol: string;
  nombre: string;
  descripcion: string;
  permissions: AppPermissions;
}

interface UserData {
  id: string;
  email: string;
  nombre?: string;        // ← AGREGAR
  activo: boolean;        // ← AGREGAR
  aprobado: boolean;      // ← AGREGAR
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
  selectedLocationId: string | null

  setSessionData: (data: SessionData | null) => void;
  setCurrentLocation: (location: UserLocation | null) => void;
  clearUser: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  canViewRoute: (routeKey: string) => boolean;
  checkMenuPermission: (menu: string, permission: string) => boolean;
  clearSessionData: () => void;
  isUserApproved: () => boolean;      // ← AGREGAR helper
  isUserActive: () => boolean;        // ← AGREGAR helper
  setSelectedLocation: (locationId: string) => void // ← NUEVO
  getSelectedLocationId: () => string | null // ← NUEVO
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      sessionData: null,
      currentLocation: null,
      isAuthenticated: false,
      selectedLocationId: null,

      setSessionData: (data) => {
        set({
          sessionData: data,
          isAuthenticated: !!data
        });
      },

      clearSessionData: () =>
        set({
          sessionData: null,
          isAuthenticated: false,
          selectedLocationId: null
        }),

      setCurrentLocation: (location) => set({ currentLocation: location }),

      clearUser: () => {
        get().clearSessionData();
      },

      hasPermission: () => {
        return true;
      },

      hasRole: (roleName: string) => {
        const state = get();
        const userRole = state.sessionData?.user.role?.nombre;
        if (!userRole) return false;
        return userRole.toLowerCase().trim() === roleName.toLowerCase().trim();
      },

      checkMenuPermission: (menu: string, permission: string) => {
        const state = get();
        const menuPermissions = state.sessionData?.user.role?.permissions?.menu;

        if (!menuPermissions || !menuPermissions[menu]) {
          return false;
        }

        return !!menuPermissions[menu][permission];
      },

      canViewRoute: (routeKey: string) => {
        const state = get();
        const menuPermissions = state.sessionData?.user.role?.permissions?.menu;

        if (!menuPermissions) {
          return false;
        }

        const routePermission = menuPermissions[routeKey];
        return routePermission?.show_view === true;
      },

      // ← NUEVOS HELPERS
      isUserApproved: () => {
        const state = get();
        return state.sessionData?.user.aprobado === true;
      },

      isUserActive: () => {
        const state = get();
        return state.sessionData?.user.activo === true;
      },

      setSelectedLocation: (locationId) => {
        set({ selectedLocationId: locationId })
        // Opcional: también guardar en localStorage como backup
        localStorage.setItem('minca_location_id', locationId)
      },

      getSelectedLocationId: () => {
        const state = get()
        return state.selectedLocationId
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        sessionData: state.sessionData,
        isAuthenticated: state.isAuthenticated,
        selectedLocationId: state.selectedLocationId,
        currentLocation: state.currentLocation,
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);