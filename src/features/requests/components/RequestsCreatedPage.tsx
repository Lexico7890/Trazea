import { useEffect, useState } from "react";
import { useRequestsStore } from "../store/useRequestsStore";
import { getLocations } from "../services/requestsService";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export default function RequestsCreatedPage() {
  const { selectedItems, destinations, setDestinations, removeItem, clearItems } = useRequestsStore();
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    async function loadLocations() {
      try {
        const locations = await getLocations();
        setDestinations(locations);
      } catch (error) {
        toast.error("Error al cargar las ubicaciones");
      }
    }
    loadLocations();
  }, [setDestinations]);

  const handleSubmit = () => {
    if (!selectedDestination) {
      toast.error("Seleccione un destino");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Agregue repuestos a la solicitud");
      return;
    }

    console.log("Enviando solicitud:", {
        destination: selectedDestination,
        comment,
        items: selectedItems
    });

    // Placeholder for submission logic
    toast.success("Solicitud enviada (simulación)");

    // Clear form
    setComment("");
    setSelectedDestination("");
    clearItems();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {/* Left Column: Form */}
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Nueva Solicitud</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Destino</label>
            <Select onValueChange={setSelectedDestination} value={selectedDestination}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione taller destino" />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((dest) => (
                  <SelectItem key={dest.id_localizacion} value={String(dest.id_localizacion)}>
                    {dest.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Comentarios</label>
            <Textarea
              placeholder="Agregue un comentario..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-auto border rounded-md p-2">
            <h3 className="font-medium mb-2">Repuestos Seleccionados</h3>
            {selectedItems.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay repuestos seleccionados.</p>
            ) : (
              <ul className="space-y-2">
                {selectedItems.map((item) => (
                  <li key={item.id} className="flex items-center justify-between p-2 bg-accent/50 rounded-md">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.referencia}</span>
                      <span className="text-xs text-muted-foreground">{item.nombre}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button onClick={handleSubmit} className="w-full mt-auto">
            Enviar Solicitud
          </Button>
        </CardContent>
      </Card>

      {/* Right Column: History */}
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Historial de Solicitudes Enviadas</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {/*
                 TODO: Fetch history from Supabase here.
                 const { data } = await supabase.from('solicitudes').select('*')...
               */}
               <TableRow>
                 <TableCell colSpan={3} className="text-center text-muted-foreground">
                   Historial no disponible por el momento.
                 </TableCell>
               </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
