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

export default function RequestsCreatedPage() {
  const {
    cartItems,
    destinations,
    setDestinations,
    loadCart,
    removeItemFromCart,
    clearCartAfterSubmit
  } = useRequestsStore();

  const { sessionData, currentLocation, hasRole } = useUserStore();
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [comment, setComment] = useState("");
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isTechnician = hasRole('tecnico');

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

  // Load cart when location is available
  useEffect(() => {
    if (currentLocation?.id_localizacion) {
      loadCart(String(currentLocation.id_localizacion));
    }
  }, [currentLocation, loadCart]);

  const handleSubmit = async () => {
    if (!selectedDestination) {
      toast.error("Seleccione un destino");
      return;
    }
    if (cartItems.length === 0) {
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
      // 1. Create Request
      await createRequest({
        id_localizacion_origen: String(currentLocation.id_localizacion),
        id_localizacion_destino: selectedDestination,
        id_usuario_solicitante: sessionData.user.id,
        observaciones_generales: comment,
        items: cartItems.map(item => ({
          id_repuesto: item.id_repuesto,
          cantidad: item.cantidad
        })),
      });

      toast.success("Solicitud enviada exitosamente");

      // 2. Clear Cart Items from DB
      const cartIds = cartItems.map(item => item.id_item_carrito);
      await clearCartAfterSubmit(cartIds);

      // 3. Reload History
      const historyData = await getRequestHistory();
      setHistory(historyData);

      // 4. Reset Form
      setComment("");
      setSelectedDestination("");

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
          {!isTechnician && (
            <>
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
            </>
          )}

          <div className="flex-1 overflow-auto border rounded-md p-2">
            <h3 className="font-medium mb-2">Repuestos Seleccionados (Carrito Taller)</h3>
            {cartItems.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay repuestos en el carrito de este taller.</p>
            ) : (
              <ul className="space-y-2">
                {cartItems.map((item) => (
                  <li key={item.id_item_carrito} className="flex items-center justify-between p-2 bg-accent/50 rounded-md">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.referencia}</span>
                      <span className="text-xs text-muted-foreground">{item.nombre_repuesto}</span>
                      <span className="text-[10px] text-muted-foreground">
                        Solicitado por: {item.nombre_solicitante}
                        {item.cantidad > 1 && ` (x${item.cantidad})`}
                      </span>
                    </div>
                    {!isTechnician && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItemFromCart(item.id_item_carrito)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!isTechnician && (
            <Button onClick={handleSubmit} className="w-full mt-auto" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          )}
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
