import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Inventory from "./pages/Inventory";
import NotFound from "./pages/NotFound";
import "./App.css";
import { ThemeProvider } from "./components/theme-provider";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./shared/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { Separator } from "./shared/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./shared/ui/breadcrumb";
import InventoryPage from "./pages/inventario/ui/InventoryPage";
import RepuestosPage from "./features/repuestos/components/RepuestosPage";
import RecordsPage from "./pages/records/ui/records-page";
import RequestsPage from "./features/requests/components/RequestsPage";
import RequestsCreatedPage from "./features/requests/components/RequestsCreatedPage";
import RequestsSentPage from "./features/requests/components/RequestsSentPage";
import { Toaster } from "./shared/ui/sonner";
import ConteoPage from "./pages/count/ui/ConteoPage";
import { useUserStore } from "@/entities/user/model/useUserStore";
import { LoginPage } from "./pages/auth/ui/login-page";
import { useSupabaseAuthListener } from "./shared/lib/useSupabaseAuthListener";
import { UpdatePasswordPage } from "./pages/auth/ui/update-password-page";

import { LocationSelector } from "./components/common/LocationSelector";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { NotificationsMenu } from "./widgets/notifications/ui/NotificationsMenu";

const ROUTE_NAMES: Record<string, string> = {
  "/": "Inventario",
  "/repuestos": "Repuestos",
  "/registros": "Registros",
  "/solicitudes": "Solicitudes",
  "/solicitudes/creadas": "Solicitudes Creadas",
  "/solicitudes/enviadas": "Solicitudes Enviadas",
  "/inventario": "Inventario (Legacy)",
  "/inventario/conteo": "Conteo de Inventario",
};

function App() {
  useSupabaseAuthListener();
  const location = useLocation();
  const { isAuthenticated } = useUserStore();

  // Generate breadcrumbs based on current location
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    return {
      path,
      label: ROUTE_NAMES[path] || segment.charAt(0).toUpperCase() + segment.slice(1),
    };
  });

  // Always prepend Home/Inventory if distinct, but here '/' is Inventory.
  // If we are at root, breadcrumbs is empty.
  const isRoot = location.pathname === "/";

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/update-password"
          element={<UpdatePasswordPage />}
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <SidebarProvider>
                <LocationSelector />
                <AppSidebar />
                <SidebarInset>
                  <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
                    <div className="flex items-center gap-2">
                      <SidebarTrigger className="-ml-1" />
                      <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                      />
                      <Breadcrumb>
                        <BreadcrumbList>
                          {isRoot ? (
                            <BreadcrumbItem>
                              <BreadcrumbPage>Inventario</BreadcrumbPage>
                            </BreadcrumbItem>
                          ) : (
                            <>
                              <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
                              </BreadcrumbItem>
                              {breadcrumbs.map((crumb, index) => (
                                <div key={crumb.path} className="flex items-center gap-2">
                                  <BreadcrumbSeparator className="hidden md:block" />
                                  <BreadcrumbItem>
                                    {index === breadcrumbs.length - 1 ? (
                                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                    ) : (
                                      <BreadcrumbLink href={crumb.path}>
                                        {crumb.label}
                                      </BreadcrumbLink>
                                    )}
                                  </BreadcrumbItem>
                                </div>
                              ))}
                            </>
                          )}
                        </BreadcrumbList>
                      </Breadcrumb>
                    </div>
                    <NotificationsMenu />
                  </header>
                  <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <Routes>
                      {/* Protected Routes Wrapper */}
                      <Route element={<ProtectedRoute routeKey="inventario" />}>
                         <Route path="/" element={<InventoryPage />} />
                      </Route>

                      <Route element={<ProtectedRoute routeKey="repuestos" />}>
                        <Route path="/repuestos" element={<RepuestosPage />} />
                      </Route>

                      <Route element={<ProtectedRoute routeKey="registros" />}>
                         <Route path="/registros" element={<RecordsPage />} />
                      </Route>

                      {/* Note: 'inventario' route (legacy) might need a permission check or just link to 'mi_inventario' perm?
                          For now, I'll protect it with 'inventario' as well. */}
                      <Route element={<ProtectedRoute routeKey="inventario" />}>
                         <Route path="/inventario" element={<Inventory />} />
                         <Route path="/inventario/conteo" element={<ConteoPage />} />
                      </Route>

                      <Route element={<ProtectedRoute routeKey="solicitudes" />}>
                        <Route path="/solicitudes" element={<RequestsPage />}>
                          <Route path="creadas" element={<RequestsCreatedPage />} />
                          <Route path="enviadas" element={<RequestsSentPage />} />
                        </Route>
                      </Route>

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </SidebarInset>
              </SidebarProvider>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
      <Toaster richColors />
    </ThemeProvider>
  );
}

export default App;
