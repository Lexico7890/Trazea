import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/shared/ui/breadcrumb";
import { ThemeProvider, useSupabaseAuthListener } from "@/shared/lib";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar";
import { Separator } from "@/shared/ui/separator";
import { useUserStore, NoRoleModal } from "@/entities/user";
import { ROUTE_NAMES } from "../constants";
import { AuthCallback, LoginPage, PendingApproval, UpdatePasswordPage } from "@/pages/auth";
import { LocationSelector } from "@/entities/locations";
import { AppSidebar } from "@/widgets/nav";
import { NotificationsMenu } from "@/widgets/notifications";
import { ProtectedRoute } from "../providers/ProtectedRoute";
import { MovementHistoryPage } from "@/pages/inventario";
import InventoryPage from "@/pages/inventario/ui/InventoryPage";
import { RepuestosPage } from "@/pages/spares";
import { RecordsPage } from "@/pages/records";
import Inventory from "@/pages/Inventory";
import { ConteoPage, ResultadosConteoPage } from "@/pages/count";
import { RequestsPage } from "@/pages/requests";
import { RequestsCreatedPage } from "@/features/spares-request-workshop";
import { RequestsSentPage } from "@/features/requests-sended";
import { Toaster } from "sonner";
import NotFound from "@/pages/NotFound";
import { OrdersPage } from "@/pages/orders";
import { DynamoPage } from "@/pages/dynamo";
//import "../styles/App.css";

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
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
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
                <NoRoleModal />
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
                      <Route element={<ProtectedRoute routeKey="ordenes" />}>
                        <Route path="/ordenes" element={<OrdersPage />} />
                      </Route>

                      {/* Note: 'inventario' route (legacy) might need a permission check or just link to 'mi_inventario' perm?
                          For now, I'll protect it with 'inventario' as well. */}
                      <Route element={<ProtectedRoute routeKey="inventario" />}>
                        <Route path="/inventario" element={<Inventory />} />
                        <Route path="/inventario/conteo" element={<ConteoPage />} />
                        <Route path="/inventario/conteo/resultados" element={<ResultadosConteoPage />} />
                        <Route path="/inventario/movimientos/:referencia" element={<MovementHistoryPage />} />
                      </Route>

                      <Route element={<ProtectedRoute routeKey="solicitudes" />}>
                        <Route path="/solicitudes" element={<RequestsPage />}>
                          <Route path="creadas" element={<RequestsCreatedPage />} />
                          <Route path="enviadas" element={<RequestsSentPage />} />
                        </Route>
                      </Route>
                      <Route path="/dynamo" element={<DynamoPage />} />
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
