import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Loader2, Search, Filter, Eye, X, User } from "lucide-react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useMemo } from "react";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import type { Guarantee } from "../model/types";
import { useGarantiasDashboard } from "../lib/useGuaranteesDashboard";
import GuaranteeDetailsModal from "./GuaranteeDetailsModal";

export function GuaranteesDashboard() {
  const { data: warranties, isLoading, isError, error } = useGarantiasDashboard();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal state
  const [selectedWarranty, setSelectedWarranty] = useState<Guarantee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredWarranties = useMemo(() => {
    if (!warranties) return [];

    return warranties.filter((item: Guarantee) => {
      const matchesSearch =
        item.nombre_repuesto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.referencia_repuesto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.taller_origen?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || item.estado?.toLowerCase() === statusFilter.toLowerCase();

      let matchesDate = true;
      if (startDate || endDate) {
        const itemDate = new Date(item.fecha_reporte);
        const start = startDate ? startOfDay(new Date(startDate)) : null;
        const end = endDate ? endOfDay(new Date(endDate)) : null;

        if (start && end) {
          matchesDate = isWithinInterval(itemDate, { start, end });
        } else if (start) {
          matchesDate = itemDate >= start;
        } else if (end) {
          matchesDate = itemDate <= end;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [warranties, searchTerm, statusFilter, startDate, endDate]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const handleOpenModal = (warranty: Guarantee) => {
    setSelectedWarranty(warranty);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center p-12 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Cargando dashboard de garantías...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-destructive">
        <p>Error al cargar el dashboard de garantías</p>
        <p className="text-sm">{error instanceof Error ? error.message : "Error desconocido"}</p>
      </div>
    );
  }

  return (
    <div className="mt-12 w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard de Garantías</h2>
          <p className="text-muted-foreground">Monitoreo y gestión de reportes técnicos.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-primary uppercase tracking-wider">
            {filteredWarranties.length} Reportes encontrados
          </span>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-muted/40 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="lg:col-span-2 space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Buscar Repuesto</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nombre o referencia..."
                    className="pl-9 bg-background shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-background shadow-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="aprobado">Aprobado</SelectItem>
                    <SelectItem value="rechazado">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Rango de Fecha</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="date"
                    className="bg-background shadow-sm text-xs w-full"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    type="date"
                    className="bg-background shadow-sm text-xs w-full"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={resetFilters}
                  title="Limpiar filtros"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button variant="secondary" className="w-full gap-2 shadow-sm font-medium">
                  <Filter className="h-4 w-4" /> Filtrar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-card shadow-lg overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold py-4">Fecha</TableHead>
                <TableHead className="font-bold">Repuesto</TableHead>
                <TableHead className="font-bold">Referencia</TableHead>
                <TableHead className="font-bold">Orden</TableHead>
                <TableHead className="font-bold">Estado</TableHead>
                <TableHead className="font-bold text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWarranties.map((item: Guarantee) => (
                <TableRow
                  key={item.id_garantia}
                  className="group hover:bg-muted/30 transition-colors cursor-default"
                >
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {item.fecha_reporte
                          ? format(new Date(item.fecha_reporte), "dd MMM, yyyy", { locale: es })
                          : "-"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.fecha_reporte
                          ? format(new Date(item.fecha_reporte), "HH:mm")
                          : ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col max-w-[200px]">
                      <span className="font-semibold truncate">{item.nombre_repuesto}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> {item.solicitante}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                      {item.referencia_repuesto}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.orden}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize border shadow-sm ${item.estado === 'pendiente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      item.estado === 'aprobado' ? 'bg-green-50 text-green-700 border-green-200' :
                        item.estado === 'rechazado' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                      {item.estado || 'Pendiente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(item)}
                      className="flex items-center gap-2 ml-auto font-semibold transition-all duration-200 hover:bg-green-400 hover:text-green-700"
                    >
                      <Eye className="h-4 w-4" /> Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredWarranties.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Search className="h-6 w-6 text-muted-foreground opacity-20" />
                      </div>
                      <p className="text-muted-foreground font-medium">No se encontraron garantías que coincidan.</p>
                      <Button variant="link" onClick={resetFilters}>Limpiar todos los filtros</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <GuaranteeDetailsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        guarantee={selectedWarranty}
      />
    </div>
  );
}
