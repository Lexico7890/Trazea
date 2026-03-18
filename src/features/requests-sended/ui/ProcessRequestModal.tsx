import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { processReceivedRequest, getRepuestosByIds, type ReceivedRequest, type ReceivedRequestItem } from "../api";

interface ProcessRequestModalProps {
  request: ReceivedRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProcessRequestModal({ request, isOpen, onClose, onSuccess }: ProcessRequestModalProps) {
  const [items, setItems] = useState<ReceivedRequestItem[]>([]);
  const [repuestosInfo, setRepuestosInfo] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingParts, setIsLoadingParts] = useState(false);

  useEffect(() => {
    if (request && isOpen) {
      // Initialize items with default values if not already present
      const initialItems = request.items.map(item => ({
        ...item,
        status: item.status ?? false,
        cantidad_enviada: item.cantidad_enviada ?? 0
      }));
      setItems(initialItems);

      // Fetch parts info for mapping IDs to Names
      const fetchParts = async () => {
        setIsLoadingParts(true);
        try {
          const ids = request.items.map(i => i.id_repuesto);
          const parts = await getRepuestosByIds(ids);
          const partsMap = parts.reduce((acc: any, part: any) => {
            acc[part.id_repuesto] = part;
            return acc;
          }, {});
          setRepuestosInfo(partsMap);
        } catch (error) {
          toast.error("Error al cargar los nombres de los repuestos");
        } finally {
          setIsLoadingParts(false);
        }
      };

      fetchParts();
    }
  }, [request, isOpen]);

  const handleStatusChange = (index: number, checked: boolean) => {
    const updated = [...items];
    updated[index].status = checked;
    if (!checked) {
      updated[index].cantidad_enviada = 0;
    }
    setItems(updated);
  };

  const handleQuantityChange = (index: number, val: string) => {
    const updated = [...items];
    if (val === '') {
      updated[index].cantidad_enviada = undefined; // Permite borrar el campo
      updated[index].status = false;
    } else {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed)) {
        updated[index].cantidad_enviada = parsed;
        if (parsed > 0) {
          updated[index].status = true; // Auto-seleccionar si ingresa cantidad
        }
      }
    }
    setItems(updated);
  };

  const handleProcess = async () => {
    if (!request) return;
    setIsSubmitting(true);
    try {
      await processReceivedRequest(request.id_solicitud, items);
      toast.success("¡Solicitud enviada exitosamente!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("No se pudo procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] p-4 md:p-6 overflow-hidden max-h-[90vh] flex flex-col border border-zinc-800 bg-zinc-950">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold orbitron-title text-[#2ecc71] mb-2 drop-shadow-[0_0_8px_rgba(46,204,113,0.5)]">
            Procesar Envío
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Desde: <span className="text-white font-semibold">{request.origen?.nombre || 'Sede Origen'}</span>
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1">
          {isLoadingParts ? (
            <div className="flex justify-center p-8"><span className="animate-pulse">Cargando repuestos...</span></div>
          ) : (
            items.map((item, index) => {
              const part = repuestosInfo[item.id_repuesto];
              return (
                <div key={index} className={`p-4 rounded-xl border ${item.status ? 'border-[#2ecc71] bg-[#2ecc71]/10' : 'border-zinc-800 bg-zinc-900/50'} transition-all duration-300 shadow-sm`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-sm">{part?.nombre || 'Repuesto Desconocido'}</h4>
                      <span className="text-xs text-muted-foreground">REF: {part?.referencia || item.id_repuesto.slice(0,8)}</span>
                    </div>
                    {/* Hiding original 'cantidad' per user request */}
                  </div>
                  
                  <div className="flex flex-row items-center justify-between gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`status-${index}`}
                        checked={item.status}
                        onCheckedChange={(checked) => handleStatusChange(index, checked === true)}
                        className="data-[state=checked]:bg-[#2ecc71] data-[state=checked]:border-[#2ecc71]"
                      />
                      <label 
                        htmlFor={`status-${index}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Enviar
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground">Cant:</label>
                      <Input 
                        type="number"
                        min="0"
                        className="w-20 text-center h-8 bg-black/50 border-zinc-700 focus-visible:ring-[#2ecc71] focus-visible:border-[#2ecc71]"
                        value={item.cantidad_enviada === undefined ? '' : item.cantidad_enviada}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="mt-6 pt-4 border-t border-zinc-800 flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button 
            onClick={handleProcess} 
            disabled={isSubmitting} 
            className="w-full sm:w-auto bg-[#2ecc71] hover:bg-[#27ae60] text-black font-bold shadow-[0_0_15px_rgba(46,204,113,0.4)] transition-all duration-300"
          >
            {isSubmitting ? 'Procesando...' : 'Confirmar Envío'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
