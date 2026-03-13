// store/useUserStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserLocation } from './types';

// Definición de permisos basada en la estructura proporcionada
export interface MenuPermissions {
  show_view?: boolean;
  upload?: boolean;
  edit_product?: boolean;
  create_product?: boolean;
  view_assigned_location_only?: boolean;
  descontinuate?: boolean;
  show_form_register?: boolean;
  edit_register?: boolean;
  delete?: boolean;
  bulk_upload?: boolean;
  create_spare?: boolean;
  show_warranties?: boolean;
  [key: string]: boolean | undefined;
}

export interface AppPermissions {
  menu: {
    dynamo?: MenuPermissions;
    inventory?: MenuPermissions;
    spares?: MenuPermissions;
    registros?: MenuPermissions;
    registers?: MenuPermissions;
    order_tracking?: MenuPermissions;
    solicitudes?: MenuPermissions;
    [key: string]: MenuPermissions | undefined;
  };
  dashboard?: {
    view_global_stats?: boolean;
    view_financial_data?: boolean;
  };
  inventory?: {
    edit_product?: boolean;
    create_product?: boolean;
    delete_product?: boolean;
    view_cost_price?: boolean;
    view_all_locations?: boolean;
    adjust_stock_manual?: boolean;
    view_assigned_location_only?: boolean;
  };
  logistics?: {
    reject_transfer?: boolean;
    view_all_orders?: boolean;
    approve_transfer_in?: boolean;
    approve_transfer_out?: boolean;
    create_transfer_order?: boolean;
  };
  technical_ops?: {
    assign_to_tech?: boolean;
    create_tech_user?: boolean;
    receive_from_tech?: boolean;
    view_tech_history?: boolean;
  };
  users_and_access?: {
    create_user?: boolean;
    edit_user_roles?: boolean;
    view_audit_logs?: boolean;
    assign_locations?: boolean;
    changes_location?: boolean;
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
  nombre?: string;
  activo: boolean;
  aprobado: boolean;
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
  canViewRoute: (routeKey: string) => boolean;
  checkMenuPermission: (menu: string, permission: string) => boolean;
  clearSessionData: () => void;
  isUserApproved: () => boolean;
  isUserActive: () => boolean;
}

const ROUTE_KEY_MAP: Record<string, string> = {
  'inventario': 'inventory',
  'inventory': 'inventario',
  'repuestos': 'spares',
  'spares': 'repuestos',
  'ordenes': 'order_tracking',
  'order_tracking': 'ordenes',
  'registros': 'registers',
  'registers': 'registros',
};

const getMenuPermissionKey = (key: string): string => {
  return ROUTE_KEY_MAP[key] || key;
};

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

      clearSessionData: () =>
        set({
          sessionData: null,
          isAuthenticated: false,
          currentLocation: null,
        }),

      setCurrentLocation: (location) => set({ currentLocation: location }),

      clearUser: () => {
        get().clearSessionData();
      },

      hasPermission: (permission: string) => {
        const state = get();
        const permissions = state.sessionData?.user.role?.permissions;
        
        if (!permissions) {
          return false;
        }

        const parts = permission.split('.');
        
        if (parts.length < 2) {
          return false;
        }

        const [section, key, action] = parts;
        
        if (section === 'menu') {
          const menuPerms = permissions.menu?.[key as keyof typeof permissions.menu];
          if (!menuPerms) return false;
          if (!action) return true;
          return !!menuPerms[action as keyof typeof menuPerms];
        }
        
        if (section === 'dashboard') {
          const dashPerms = permissions.dashboard;
          if (!dashPerms) return false;
          if (!key) return true;
          return !!dashPerms[key as keyof typeof dashPerms];
        }
        
        if (section === 'inventory') {
          const invPerms = permissions.inventory;
          if (!invPerms) return false;
          if (!key) return true;
          return !!invPerms[key as keyof typeof invPerms];
        }
        
        if (section === 'logistics') {
          const logPerms = permissions.logistics;
          if (!logPerms) return false;
          if (!key) return true;
          return !!logPerms[key as keyof typeof logPerms];
        }
        
        if (section === 'users_and_access') {
          const userPerms = permissions.users_and_access;
          if (!userPerms) return false;
          if (!key) return true;
          return !!userPerms[key as keyof typeof userPerms];
        }
        
        return false;
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

        if (!menuPermissions) {
          return false;
        }

        // Intentar con la clave nueva primero
        let menuPerms = menuPermissions[menu];
        
        // Si no existe, intentar con la clave antigua mapeada
        if (!menuPerms) {
          const mappedKey = getMenuPermissionKey(menu);
          menuPerms = menuPermissions[mappedKey];
        }

        if (!menuPerms) {
          return false;
        }

        return !!menuPerms[permission];
      },

      canViewRoute: (routeKey: string) => {
        const state = get();
        const menuPermissions = state.sessionData?.user.role?.permissions?.menu;

        if (!menuPermissions) {
          return false;
        }

        // Intentar con la clave directamente
        let routePermission = menuPermissions[routeKey];
        
        // Si no existe, intentar con la clave antigua mapeada
        if (!routePermission) {
          const mappedKey = getMenuPermissionKey(routeKey);
          routePermission = menuPermissions[mappedKey];
        }

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
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        sessionData: state.sessionData,
        isAuthenticated: state.isAuthenticated,
        currentLocation: state.currentLocation,
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);