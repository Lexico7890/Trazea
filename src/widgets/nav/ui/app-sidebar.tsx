"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  ClipboardClock,
  LifeBuoy,
  Send,
  SendToBack,
  Settings2,
  Warehouse,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar"
import { useUserStore } from "@/entities/user";
import { NavMain, NavSecondary, NavUser } from "@/widgets/nav";
import { version } from "../../../../package.json";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const sessionData = useUserStore((state) => state.sessionData);
  const canViewRoute = useUserStore((state) => state.canViewRoute);

  // Mapeo de items del menú con sus claves de permiso correspondientes
  // 'permissionKey' debe coincidir con las claves en sessionData.user.role.permissions.menu
  const allNavItems = [
    {
      title: "Dynamo",
      url: "/dynamo",
      icon: Bot,
      badge: "Beta",
      items: [],
    },
    {
      title: "Mi inventario",
      url: "/",
      icon: Warehouse,
      permissionKey: "inventario",
      items: [],
    },
    {
      title: "Repuestos",
      url: "/repuestos",
      icon: Settings2,
      permissionKey: "repuestos",
      items: [],
    },
    {
      title: "Registros",
      url: "/registros",
      icon: ClipboardClock,
      permissionKey: "registros",
      items: [],
    },
    {
      title: "Seguimiento ordenes",
      url: "/ordenes",
      icon: SendToBack,
      permissionKey: "ordenes",
      items: [],
    },
    {
      title: "Solicitudes",
      url: "#",
      icon: Send,
      permissionKey: "solicitudes",
      items: [
        {
          title: "Creadas",
          url: "/solicitudes/creadas",
        },
        {
          title: "Enviadas",
          url: "/solicitudes/enviadas",
        },
      ],
    },
    // Items sin 'permissionKey' se mostrarán siempre (o se pueden proteger con otra lógica)
    // Por ahora los ocultamos o dejamos como estáticos si no están en el objeto de permisos
    // El usuario solo especificó permisos para las rutas principales
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [],
      // permissionKey: undefined // Siempre visible si no se define
    }
  ];

  const filteredNavMain = allNavItems.filter((item) => {
    if (!item.permissionKey) return true; // Si no tiene clave, mostrar (o definir política default)
    return canViewRoute(item.permissionKey);
  });

  const userData = {
    name: sessionData?.user.email?.split('@')[0] || "Usuario",
    email: sessionData?.user.email || "",
    avatar: "/avatars/default.jpg", // Podríamos usar algo del usuario si existiera
  };

  const navSecondary = [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ];

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <img src="/trazea-icon.svg" alt="Workshop Logo" className="size-8" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Trazea</span>
                  <span className="truncate text-xs">V-{version}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
