import { useEffect, useState } from "react";
import { useRequestsStore } from "../store/useRequestsStore";
import { getLocations, createRequest, getRequestHistory, type RequestHistoryItem } from "../services/requestsService";
import { useUserStore } from "@/store/useUserStore";
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
import { sendWhatsAppNotification } from "@/lib/utils";

export default function RequestsCreatedPage() {
  const { selectedItems, destinations, setDestinations, removeItem, clearItems } = useRequestsStore();
  const { sessionData, currentLocation } = useUserStore();
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [comment, setComment] = useState("");
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    async function loadHistory() {
      try {
        const historyData = await getRequestHistory();
        setHistory(historyData);
      } catch (error) {
        toast.error("Error al cargar el historial");
      }
    }
    loadHistory();
  }, []);

  const handleSubmit = async () => {
    if (!selectedDestination) {
      toast.error("Seleccione un destino");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Agregue repuestos a la solicitud");
      return;
    }
    if (!currentLocation) {
      toast.error("No se ha seleccionado una ubicación de origen");
      return;
    }
    if (!sessionData?.user?.id) {
      toast.error("No se ha identificado el usuario");
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequest({
        id_localizacion_origen: currentLocation.id_localizacion,
        id_localizacion_destino: selectedDestination,
        id_usuario_solicitante: sessionData.user.id,
        observaciones_generales: comment,
        items: selectedItems.map(item => ({ id_repuesto: item.id })),
      });

      toast.success("Solicitud enviada exitosamente", { icon: '✅', duration: 5000 });

      // Reload history
      const historyData = await getRequestHistory();
      setHistory(historyData);

      // Clear form
      setComment("");
      setSelectedDestination("");
      clearItems();

      // PASO 3: ¡INTEGRACIÓN DE WHATSAPP! 🟢
      // Solo lanzamos el WhatsApp si la BD guardó todo correctamente.
      const selectedDestinationPhone = destinations.find(dest => dest.id_localizacion === selectedDestination);

      if (selectedDestinationPhone?.telefono) {
        // Usamos la utilidad que creamos
        sendWhatsAppNotification(
          selectedItems, 
          {
            origen: selectedDestinationPhone.nombre,
            destino: currentLocation.nombre,
            solicitante: sessionData.user.email
          },
          selectedDestinationPhone.telefono
        );
      } else {
        toast("Solicitud guardada, pero el destino no tiene WhatsApp configurado", { icon: '⚠️', duration: 5000 });
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Error al enviar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
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

          <Button onClick={handleSubmit} className="w-full mt-auto" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
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
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No hay solicitudes en el historial.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((item) => (
                  <TableRow key={item.id_solicitud}>
                    <TableCell>{new Date(item.fecha_creacion).toLocaleDateString()}</TableCell>
                    <TableCell>{item.nombre_destino}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        item.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                        item.estado === 'rechazada' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.estado}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
