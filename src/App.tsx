import { Routes, Route, Navigate } from "react-router-dom";
import Inventory from "./pages/Inventory";
import NotFound from "./pages/NotFound";
import "./App.css";
import { ThemeProvider } from "./components/theme-provider";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { Separator } from "./components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./components/ui/breadcrumb";
import InventoryPage from "./features/inventory/components/InventoryPage";
import RepuestosPage from "./features/repuestos/components/RepuestosPage";
import RecordsPage from "./features/records/components/records-page";
import { Toaster } from "./components/ui/sonner";
import { useUserStore } from "@/store/useUserStore";
import { LoginPage } from "./features/login/components/login-page";
import { useSupabaseAuthListener } from "./hooks/useSupabaseAuthListener";
import { UpdatePasswordPage } from "./features/login/components/update-password-page";

function App() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  useSupabaseAuthListener();

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
                <AppSidebar />
                <SidebarInset>
                  <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                      <SidebarTrigger className="-ml-1" />
                      <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                      />
                      <Breadcrumb>
                        <BreadcrumbList>
                          <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href="#">
                              Building Your Application
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                          <BreadcrumbSeparator className="hidden md:block" />
                          <BreadcrumbItem>
                            <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                          </BreadcrumbItem>
                        </BreadcrumbList>
                      </Breadcrumb>
                    </div>
                  </header>
                  <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <Routes>
                      <Route path="/" element={<InventoryPage />} />
                      <Route path="/repuestos" element={<RepuestosPage />} />
                      <Route path="/registros" element={<RecordsPage />} />
                      <Route path="/inventario" element={<Inventory />} />
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

/**
 * 
 */
