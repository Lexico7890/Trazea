import { Search, Calendar, X } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

interface GuaranteesFiltersProps {
  searchTerm: string;
  statusFilter: string;
  dateFrom: string;
  dateTo: string;
  totalGroups: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClearFilters: () => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "sin enviar", label: "Sin enviar" },
  { value: "pendiente", label: "Pendiente" },
  { value: "aprobada", label: "Aprobada" },
] as const;

export function GuaranteesFilters({
  searchTerm,
  statusFilter,
  dateFrom,
  dateTo,
  totalGroups,
  onSearchChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
}: GuaranteesFiltersProps) {
  const hasActiveFilters = Boolean(searchTerm || statusFilter !== "all" || dateFrom || dateTo);

  return (
    <Card className="border-none shadow-sm bg-muted/40 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2 lg:col-span-1">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Orden, repuesto, técnico..."
                className="pl-9 bg-background shadow-sm"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Estado</Label>
            <Select value={statusFilter} onValueChange={onStatusChange}>
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

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Fecha desde
            </Label>
            <Input
              type="date"
              className="bg-background"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Fecha hasta
            </Label>
            <Input
              type="date"
              className="bg-background"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {totalGroups} órdenes encontradas
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="hover:bg-destructive/10 hover:text-destructive transition-colors gap-2"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
