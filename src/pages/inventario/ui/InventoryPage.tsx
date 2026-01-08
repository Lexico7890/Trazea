import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Pagination } from "@/components/common/Pagination";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  Plus,
  RefreshCw,
  FileScan,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Link } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Camera } from "lucide-react";
import type { InventoryParams } from "@/entities/inventario";
import { InventoryForm } from "@/features/inventario-crear-repuesto";
import { useUserStore } from "@/entities/user";
import { InventoryFilters, useInventoryFilters, useInventoryQuery } from "@/features/inventory-filters";
import { InventoryImageUploadModal } from "./InventoryImageUploadModal";
import { InventoryTableSkeleton } from "./InventoryTableSkeleton";
import { InventoryTable } from "./InventoryTable";

export default function InventoryPage() {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const { hasRole } = useUserStore();
  const {
    filters,
    updateSearch,
    updateStockState,
    updateDescontinuado,
    updatePage,
    updateLimit,
    updateSort,
    resetFilters,
  } = useInventoryFilters();

  // Build API params from filters
  const apiParams = useMemo<InventoryParams>(() => {
    const params: InventoryParams = {
      page: filters.page,
      limit: filters.limit,
      order_by: filters.orderBy,
      direction: filters.direction,
    };

    // Add search filter
    if (filters.search) {
      params.search = filters.search;
    }

    // Add estado_stock filter
    if (filters.estado_stock !== 'all') {
      params.estado_stock = filters.estado_stock;
    }

    // Add descontinuado filter
    if (filters.descontinuado !== 'all') {
      params.descontinuado = filters.descontinuado === 'discontinued';
    }

    return params;
  }, [filters]);

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useInventoryQuery(apiParams);

  return (
    <div className="container mx-auto p-2 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Inventario de Repuestos</h1>
        <div className="flex items-center gap-2">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {!hasRole("tecnico") && (
              <Link to="/inventario/conteo">
                <Button variant="outline">
                  <FileScan className="h-4 w-4 mr-2" />
                  Conteo
                </Button>
              </Link>
            )}
            {!hasRole("tecnico") && (
              <InventoryImageUploadModal
                trigger={
                  <Button variant="outline" size="icon">
                    <Camera className="h-4 w-4" />
                  </Button>
                }
              />
            )}
            {!hasRole("tecnico") && (
              <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Agregar al Inventario</DialogTitle>
                    <DialogDescription>
                      Selecciona un repuesto y la cantidad para agregar al
                      inventario actual.
                    </DialogDescription>
                  </DialogHeader>
                  <InventoryForm onSuccess={() => setAddDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Mobile Actions (Popover) */}
          <div className="md:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="flex flex-col gap-2">
                  {!hasRole("tecnico") && (
                    <Link to="/inventario/conteo">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                      >
                        <FileScan className="h-4 w-4 mr-2" />
                        Conteo
                      </Button>
                    </Link>
                  )}
                  {!hasRole("tecnico") && (
                    <InventoryImageUploadModal
                      trigger={
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Tomar Foto
                        </Button>
                      }
                    />
                  )}
                  {!hasRole("tecnico") && (
                    <Dialog
                      open={isAddDialogOpen}
                      onOpenChange={setAddDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Agregar al Inventario</DialogTitle>
                          <DialogDescription>
                            Selecciona un repuesto y la cantidad para agregar
                            al inventario actual.
                          </DialogDescription>
                        </DialogHeader>
                        <InventoryForm
                          onSuccess={() => setAddDialogOpen(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Refresh button visible on all screen sizes */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <InventoryFilters
            search={filters.search}
            estado_stock={filters.estado_stock}
            descontinuado={filters.descontinuado}
            onSearchChange={updateSearch}
            onEstadoStockChange={updateStockState}
            onDescontinuadoChange={updateDescontinuado}
            onReset={resetFilters}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <InventoryTableSkeleton />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-destructive font-semibold text-lg">
                Error al cargar el inventario
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {error instanceof Error ? error.message : 'Error desconocido'}
              </p>
            </div>
          ) : (
            <>
              <InventoryTable
                items={data?.items || []}
                orderBy={filters.orderBy}
                direction={filters.direction}
                onSort={updateSort}
              />
              <div className="mt-4">
                <Pagination
                  currentPage={filters.page}
                  totalPages={data?.page_count || 1}
                  totalItems={data?.total_count || 0}
                  itemsPerPage={filters.limit}
                  onPageChange={updatePage}
                  onItemsPerPageChange={updateLimit}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}