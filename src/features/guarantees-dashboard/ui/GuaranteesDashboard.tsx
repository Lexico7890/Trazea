import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useGarantiasDashboard, useUpdateGuaranteeStatus } from "../lib/useGuaranteesDashboard";
import { toast } from "sonner";
import type { GuaranteeGroup } from "../model/types";
import { GuaranteesFilters } from "./GuaranteesFilters";
import { GuaranteesTable } from "./GuaranteesTable";
import { GuaranteesPagination } from "./GuaranteesPagination";
import type { Guarantee } from "@/entities/guarantees";

interface GuaranteesDashboardProps {
  onSendWarranty?: (warranty: Guarantee[]) => void;
}

export function GuaranteesDashboard({ onSendWarranty }: GuaranteesDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: warranties = [], isLoading, isError, error } = useGarantiasDashboard();
  const updateStatusMutation = useUpdateGuaranteeStatus();

  const groupedWarranties = useMemo((): GuaranteeGroup[] => {
    if (!Array.isArray(warranties)) return [];

    const groups: Record<string, Guarantee[]> = {};
    console.log("Grouping warranties:", warranties);

    warranties.forEach((w: Guarantee) => {
      const ordenKey = w.orden || 'sin-orden';
      if (!groups[ordenKey]) {
        groups[ordenKey] = [];
      }
      groups[ordenKey].push(w);
    });

    return Object.entries(groups).map(([orden, items]): GuaranteeGroup => ({
      orden,
      items,
      fecha_reporte: items[0]?.fecha_reporte,
      tecnico_responsable: items[0]?.tecnico_responsable,
      reportado_por: items[0]?.reportado_por,
      solicitante: items[0]?.solicitante,
      estado: items[0]?.estado,
      taller_origen: items[0]?.taller_origen,
      motivo_falla: items[0]?.motivo_falla,
      kilometraje: items[0]?.kilometraje,
      url_evidencia_foto: items[0]?.url_evidencia_foto,
      repuestosCount: items.length,
    }));
  }, [warranties]);

  const filteredGroups = useMemo((): GuaranteeGroup[] => {
    return groupedWarranties.filter((group: GuaranteeGroup) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || group.items.some((item: Guarantee) =>
        item.orden?.toLowerCase().includes(searchLower) ||
        item.referencia_repuesto?.toLowerCase().includes(searchLower) ||
        item.nombre_repuesto?.toLowerCase().includes(searchLower) ||
        item.tecnico_responsable?.toLowerCase().includes(searchLower) ||
        item.solicitante?.toLowerCase().includes(searchLower)
      );

      const matchesStatus = statusFilter === "all" ||
        group.estado?.toLowerCase() === statusFilter.toLowerCase();

      let matchesDateFrom = true;
      let matchesDateTo = true;

      if (dateFrom && group.fecha_reporte) {
        const itemDate = new Date(group.fecha_reporte);
        const fromDate = new Date(dateFrom);
        matchesDateFrom = itemDate >= fromDate;
      }

      if (dateTo && group.fecha_reporte) {
        const itemDate = new Date(group.fecha_reporte);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        matchesDateTo = itemDate <= toDate;
      }

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [groupedWarranties, searchTerm, statusFilter, dateFrom, dateTo]);

  const handleFilterChange = () => setCurrentPage(1);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    handleFilterChange();
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    handleFilterChange();
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    handleFilterChange();
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    handleFilterChange();
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(searchTerm || statusFilter !== "all" || dateFrom || dateTo);

  const totalItems = filteredGroups.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGroups = filteredGroups.slice(startIndex, startIndex + itemsPerPage);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      toast.success(`Estado actualizado a ${newStatus}`);
    } catch {
      toast.error("Error al actualizar el estado");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center p-12 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Cargando garantías...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-destructive">
        <p>Error al cargar las garantías</p>
        <p className="text-sm">{error instanceof Error ? error.message : "Error desconocido"}</p>
      </div>
    );
  }

  return (
    <div className="mt-12 w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Garantías</h2>
          <p className="text-muted-foreground">Tablero de control de garantías</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-primary uppercase tracking-wider">
            {filteredGroups.length} Órdenes
          </span>
        </div>
      </div>

      <GuaranteesFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        totalGroups={filteredGroups.length}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        onClearFilters={clearAllFilters}
      />

      <GuaranteesTable
        groups={paginatedGroups}
        hasActiveFilters={hasActiveFilters}
        onSendWarranty={onSendWarranty}
        onUpdateStatus={handleUpdateStatus}
        isStatusUpdatePending={updateStatusMutation.isPending}
      />

      <GuaranteesPagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}
