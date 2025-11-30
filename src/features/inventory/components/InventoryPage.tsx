import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryFilters } from "./InventoryFilters";
import { InventoryTable } from "./InventoryTable";
import { Pagination } from "@/components/common/Pagination";
import { InventoryTableSkeleton } from "./InventoryTableSkeleton";
import { useInventoryFilters } from "../hooks/useInventoryFilters";
import { useInventoryQuery } from "../hooks/useInventoryQuery";
import { useMemo, useState } from "react";
import { AlertCircle, Plus } from "lucide-react";
import type { InventoryParams } from "../types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InventoryForm } from "./InventoryForm";

export default function InventoryPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    filters,
    updateSearch,
    updateTipo,
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

    // Add tipo filter
    if (filters.tipo !== 'all') {
      params.tipo = filters.tipo;
    }

    // Add descontinuado filter
    if (filters.descontinuado !== 'all') {
      params.descontinuado = filters.descontinuado === 'discontinued';
    }

    return params;
  }, [filters]);

  const { data, isLoading, isError, error } = useInventoryQuery(apiParams);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Inventario de Repuestos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agregar al Inventario</DialogTitle>
              <DialogDescription>
                Selecciona un repuesto y la cantidad para agregar al inventario actual.
              </DialogDescription>
            </DialogHeader>
            <InventoryForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <InventoryFilters
            search={filters.search}
            tipo={filters.tipo}
            descontinuado={filters.descontinuado}
            onSearchChange={updateSearch}
            onTipoChange={updateTipo}
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