import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Loader2, Search, Info, User, Wrench, MapPin, Activity, Image, ChevronLeft, ChevronRight, X, Calendar } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { useGarantiasDashboard, useUpdateGuaranteeStatus } from "../lib/useGuaranteesDashboard";
import { format } from "date-fns";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/shared/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import { Badge } from "@/shared/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

interface GuaranteesDashboardProps {
  onSendWarranty?: (warranty: unknown) => void;
}

interface WarrantyGroup {
  orden: string;
  items: unknown[];
  fecha_reporte?: string;
  tecnico_responsable?: string;
  reportado_por?: string;
  solicitante?: string;
  estado?: string;
  taller_origen?: string;
  motivo_falla?: string;
  kilometraje?: number;
  url_evidencia_foto?: string;
  repuestosCount: number;
}


const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];
const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "sin enviar", label: "Sin enviar" },
  { value: "pendiente", label: "Pendiente" },
  { value: "aprobada", label: "Aprobada" },
];

export function GuaranteesDashboard({ onSendWarranty }: GuaranteesDashboardProps) {
  // Search and filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Use the specific hook for the dashboard view
  const { data: warranties = [], isLoading, isError, error } = useGarantiasDashboard();
  const updateStatusMutation = useUpdateGuaranteeStatus();

  // Group warranties by orden
  const groupedWarranties = useMemo(() => {
    if (!Array.isArray(warranties)) return [];
    
    const groups: Record<string, WarrantyGroup[]> = {};
    
    warranties.forEach((w: WarrantyGroup) => {
      const ordenKey = w.orden || 'sin-orden';
      if (!groups[ordenKey]) {
        groups[ordenKey] = [];
      }
      groups[ordenKey].push(w);
    });
    
    return Object.entries(groups).map(([orden, items]) => ({
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

  // Filter grouped warranties
  const filteredGroups = useMemo(() => {
    return groupedWarranties.filter((group: WarrantyGroup) => {
      // Search filter - search in any item of the group
      const searchLower = searchTerm.toLowerCase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const matchesSearch = !searchTerm || group.items.some((item: any) =>
        item.orden?.toLowerCase().includes(searchLower) ||
        item.referencia_repuesto?.toLowerCase().includes(searchLower) ||
        item.nombre_repuesto?.toLowerCase().includes(searchLower) ||
        item.tecnico_responsable?.toLowerCase().includes(searchLower) ||
        item.solicitante?.toLowerCase().includes(searchLower)
      );

      // Status filter
      const matchesStatus = statusFilter === "all" ||
        group.estado?.toLowerCase() === statusFilter.toLowerCase();

      // Date filters
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

  // Reset to first page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

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

  const hasActiveFilters = searchTerm || statusFilter !== "all" || dateFrom || dateTo;

  // Pagination logic
  const totalItems = filteredGroups.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGroups = filteredGroups.slice(startIndex, endIndex);

  const getStatusColor = (status: string | undefined) => {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus === 'sin enviar') return 'bg-orange-500 text-white border-transparent shadow-[0_0_12px_-3px_rgba(249,115,22,0.8)] hover:bg-orange-600 hover:shadow-[0_0_15px_-3px_rgba(249,115,22,1)] transition-all';
    if (lowerStatus === 'pendiente') return 'bg-blue-500 text-white border-transparent shadow-[0_0_12px_-3px_rgba(59,130,246,0.8)] hover:bg-blue-600 hover:shadow-[0_0_15px_-3px_rgba(59,130,246,1)] transition-all';
    if (lowerStatus === 'aprobada' || lowerStatus === 'aprobado') return 'bg-green-500 text-white border-transparent shadow-[0_0_12px_-3px_rgba(34,197,94,0.8)] hover:bg-green-600 hover:shadow-[0_0_15px_-3px_rgba(34,197,94,1)] transition-all';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleUpdateStatus = async (id: string | undefined, newStatus: string) => {
    if (!id) return;
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

      {/* Filters Card */}
      <Card className="border-none shadow-sm bg-muted/40 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2 lg:col-span-1">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Orden, repuesto, técnico..."
                  className="pl-9 bg-background shadow-sm"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>

            {/* Status filter */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Estado</Label>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date from filter */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Fecha desde
              </Label>
              <Input
                type="date"
                className="bg-background"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
              />
            </div>

            {/* Date to filter */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Fecha hasta
              </Label>
              <Input
                type="date"
                className="bg-background"
                value={dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
              />
            </div>
          </div>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="hover:bg-destructive/10 hover:text-destructive transition-colors gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-lg overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold">Fecha</TableHead>
                <TableHead className="font-bold">Repuesto</TableHead>
                <TableHead className="font-bold">Orden</TableHead>
                <TableHead className="font-bold">Técnico</TableHead>
                <TableHead className="font-bold">Estado</TableHead>
                <TableHead className="font-bold text-center w-[100px]">Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedGroups.map((group: {
                orden?: string;
                fecha_reporte?: string;
                items: {
                  referencia_repuesto?: string;
                  nombre_repuesto?: string;
                  motivo_falla?: string;
                  id_garantia?: string;
                }[];
                repuestosCount: number;
                tecnico_responsable?: string;
                reportado_por?: string;
                estado?: string;
                taller_origen?: string;
                motivo_falla?: string;
                kilometraje?: number;
                url_evidencia_foto?: string;
                solicitante?: string;
              }) => (
                <TableRow
                  key={group.orden}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium text-muted-foreground text-sm">
                    {group.fecha_reporte ? format(new Date(group.fecha_reporte), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent hover:text-primary flex flex-col items-start">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{group.items[0]?.referencia_repuesto}</span>
                            {group.repuestosCount > 1 && (
                              <Badge variant="secondary" className="text-[10px]">
                                +{group.repuestosCount - 1}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{group.items[0]?.nombre_repuesto}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="start">
                        <div className="bg-muted/50 p-3 border-b">
                          <h4 className="font-semibold text-sm">Repuestos ({group.repuestosCount})</h4>
                        </div>
                        <div className="max-h-60 overflow-y-auto p-2">
                          {group.items.map((item: {
                            referencia_repuesto?: string;
                            nombre_repuesto?: string;
                            motivo_falla?: string;
                          }, idx: number) => (
                            <div key={idx} className="p-2 hover:bg-muted/30 rounded-md text-sm">
                              <div className="font-medium">{item.referencia_repuesto}</div>
                              <div className="text-xs text-muted-foreground">{item.nombre_repuesto}</div>
                              {item.motivo_falla && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  <span className="font-semibold">Falla:</span> {item.motivo_falla}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono bg-background">
                      {group.orden || 'S/N'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {(group.tecnico_responsable || group.reportado_por || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm">{group.tecnico_responsable || group.reportado_por || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`uppercase text-[10px] ${getStatusColor(group.estado)}`}
                    >
                      {group.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Detalles</span>
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 p-0 overflow-hidden" align="end">
                        <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
                          <h4 className="font-semibold text-sm">Detalle de Garantía</h4>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${getStatusColor(group.estado)}`}
                          >
                            {group.estado}
                          </Badge>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1"><Activity className="h-3 w-3" /> Motivo Falla</p>
                              <p className="font-medium line-clamp-2" title={group.motivo_falla}>{group.motivo_falla || 'No especificado'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Kilometraje</p>
                              <p className="font-medium">{group.kilometraje || 0} km</p>
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Solicitante</p>
                              <p className="font-medium truncate">{group.solicitante || '-'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1"><Wrench className="h-3 w-3" /> Taller Origen</p>
                              <p className="font-medium truncate">{group.taller_origen || '-'}</p>
                            </div>
                          </div>

                          {group.url_evidencia_foto && (
                            <div className="pt-2 border-t">
                              <a
                                href={group.url_evidencia_foto}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <Image className="h-3 w-3" /> Ver evidencia fotográfica
                              </a>
                            </div>
                          )}

                          {/* Botón Enviar para garantías sin enviar */}
                          {(group.estado === 'Sin enviar' || group.estado === 'sin enviar') && (
                            <div className="pt-2 border-t">
                              <Button
                                size="sm"
                                className="w-full text-xs h-8 bg-orange-600 hover:bg-orange-700 text-white"
                                onClick={() => {
                                  if (onSendWarranty) {
                                    onSendWarranty(group.items[0]);
                                  }
                                }}
                              >
                                Enviar Garantia
                              </Button>
                            </div>
                          )}

                          {/* Botón Gestionado para garantías pendientes */}
                          {(group.estado === 'Pendiente' || group.estado === 'pendiente') && (
                            <div className="pt-2 border-t">
                              <Button
                                size="sm"
                                className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => handleUpdateStatus(group.items[0].id_garantia, 'Aprobada')}
                                disabled={updateStatusMutation.isPending}
                              >
                                {updateStatusMutation.isPending ? 'Actualizando...' : 'Gestionado'}
                              </Button>
                            </div>
                          )}
                        </div>

                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedGroups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <p className="text-muted-foreground">
                      {hasActiveFilters
                        ? "No se encontraron garantías con los filtros aplicados."
                        : "No hay garantías registradas."}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-muted/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Mostrar</span>
              <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-[70px] h-8 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>por página</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-2" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
