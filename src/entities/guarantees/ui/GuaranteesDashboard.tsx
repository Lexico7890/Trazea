import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Loader2, Search, Info, User, Wrench, MapPin, Activity, Image } from "lucide-react";
import { useState } from "react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { useGarantiasDashboard } from "../lib/useGuaranteesDashboard";
import { format } from "date-fns";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/shared/ui/hover-card";
import { Badge } from "@/shared/ui/badge";

export function GuaranteesDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  // Use the specific hook for the dashboard view
  const { data: warranties = [], isLoading, isError, error } = useGarantiasDashboard();

  // Client-side filtering
  const filteredWarranties = Array.isArray(warranties) ? warranties.filter((w: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      w.orden?.toLowerCase().includes(searchLower) ||
      w.referencia_repuesto?.toLowerCase().includes(searchLower) ||
      w.nombre_repuesto?.toLowerCase().includes(searchLower)
    );
  }) : [];

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
            {filteredWarranties.length} Registros
          </span>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-muted/40 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1 max-w-sm">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por orden o repuesto..."
                  className="pl-9 bg-background shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

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
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {filteredWarranties.map((item: any) => (
                <TableRow
                  key={item.id_garantia}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium text-muted-foreground text-sm">
                    {item.fecha_reporte ? format(new Date(item.fecha_reporte), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.referencia_repuesto}</span>
                      <span className="text-xs text-muted-foreground">{item.nombre_repuesto}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono bg-background">
                      {item.orden || 'S/N'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {(item.tecnico_responsable || item.reportado_por || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm">{item.tecnico_responsable || item.reportado_por || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.estado === 'pendiente' ? 'secondary' : 'default'} className="uppercase text-[10px]">
                      {item.estado}
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
                          <Badge variant="outline" className="text-[10px] bg-background">{item.estado}</Badge>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1"><Activity className="h-3 w-3" /> Motivo Falla</p>
                              <p className="font-medium line-clamp-2" title={item.motivo_falla}>{item.motivo_falla || 'No especificado'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Kilometraje</p>
                              <p className="font-medium">{item.kilometraje || 0} km</p>
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Solicitante</p>
                              <p className="font-medium truncate">{item.solicitante || '-'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1"><Wrench className="h-3 w-3" /> Taller Origen</p>
                              <p className="font-medium truncate">{item.taller_origen || '-'}</p>
                            </div>
                          </div>

                          {item.url_evidencia_foto && (
                            <div className="pt-2 border-t">
                              <a
                                href={item.url_evidencia_foto}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <Image className="h-3 w-3" /> Ver evidencia fotográfica
                              </a>
                            </div>
                          )}

                          <div className="pt-2">
                            <Button
                              size="sm"
                              className="w-full text-xs h-8"
                              variant="secondary"
                              onClick={() => alert("Funcionalidad pendiente")}
                            >
                              Cambiar Estado
                            </Button>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                </TableRow>
              ))}
              {filteredWarranties.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <p className="text-muted-foreground">No hay garantías registradas.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
