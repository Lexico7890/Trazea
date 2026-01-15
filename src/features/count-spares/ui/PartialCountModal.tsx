import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/shared/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { CountItem, PartialCountModalProps } from '../model/types';
import { useUserStore } from '@/entities/user';
import { generatePartialCountItems } from '../api';
import { registrarConteo } from '@/pages/count/api';

export function PartialCountModal({ isOpen, onOpenChange }: PartialCountModalProps) {
  const [items, setItems] = useState<CountItem[]>([]);
  const { currentLocation, sessionData } = useUserStore();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['partialCountItems', currentLocation?.id_localizacion],
    queryFn: () => generatePartialCountItems(currentLocation!.id_localizacion),
    enabled: !!currentLocation && isOpen,
  });

  useEffect(() => {
    if (data) {
      const initialItems = data.map((item: CountItem) => {
        const real = item.real || 0;
        const pq = item.pq || 0;
        const cantidad_sistema = item.cantidad_sistema || 0;
        const diferencia = (real + pq) - cantidad_sistema;
        return { ...item, real, pq, cantidad_sistema, diferencia };
      });
      setItems(initialItems);
    }
  }, [data]);

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  const mutation = useMutation({
    mutationFn: (params: Parameters<typeof registrarConteo>[0]) => registrarConteo(params),
    onSuccess: () => {
      toast.success('Conteo parcial guardado exitosamente.');
      queryClient.invalidateQueries({ queryKey: ['countHistory'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Error al guardar el conteo: ${error.message}`);
    },
  });

  const updateItem = (id_repuesto: string, field: keyof CountItem, value: string) => {
    const numericValue = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(numericValue)) return;

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id_repuesto === id_repuesto) {
          const updatedItem = { ...item, [field]: numericValue };
          const real = updatedItem.real ?? 0;
          const pq = updatedItem.pq ?? 0;
          const cantidad_sistema = updatedItem.cantidad_sistema ?? 0;
          updatedItem.diferencia = (real + pq) - cantidad_sistema;
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleSave = () => {
    if (!currentLocation?.id_localizacion || !sessionData?.user?.id) {
      toast.error('No se encontró la información de localización o usuario.');
      return;
    }

    const total_items_auditados = items.length;
    const total_diferencia_encontrada = items.filter(item => item.diferencia !== 0).length;
    const total_items_pq = items.reduce((sum, item) => sum + (item.pq || 0), 0);

    // Prepare items for submission, remove client-side only fields if any
    // Prepare items for submission, mapping to backend expected format
    const itemsToSend = items.map(item => ({
      id_repuesto: item.id_repuesto,
      cantidad_real: item.real || 0,
      cantidad_csa: item.cantidad_sistema || 0,
      cantidad_pq: item.pq || 0
    }));

    mutation.mutate({
      id_localizacion: currentLocation.id_localizacion,
      id_usuario: sessionData.user.id,
      tipo: 'parcial',
      total_items_auditados,
      total_diferencia_encontrada,
      total_items_pq,
      observaciones: '',
      items: itemsToSend,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm md:max-w-md lg:max-w-lg xl:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Conteo Parcial</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : isError ? (
            <div className="text-destructive flex items-center gap-2">
              <AlertCircle />
              <span>Error al cargar los items: {error.message}</span>
            </div>
          ) : (
            <div>
              {/* Desktop Headers */}
              <div className="hidden md:grid md:grid-cols-6 gap-4 pb-2 border-b font-semibold text-sm text-muted-foreground">
                <div className="md:col-span-2">Repuesto</div>
                <div className="text-center">CSA</div>
                <div className="text-center">Real</div>
                <div className="text-center">PQ</div>
                <div className="text-center">Diferencia</div>
              </div>
              {/* Items List */}
              <div className="divide-y">
                {items.map(item => (
                  <div key={item.id_repuesto} className="grid grid-cols-2 md:grid-cols-6 gap-x-4 gap-y-2 py-3 items-center">
                    {/* Item Info */}
                    <div className="col-span-2 md:col-span-2">
                      <p className="font-bold text-sm">{item.ref_excel}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.nombre}</p>
                    </div>
                    {/* System Quantity (CSA) */}
                    <div className="text-center">
                      <p className="md:hidden text-xs font-semibold text-muted-foreground">CSA</p>
                      <Input
                        type="number"
                        value={item.cantidad_sistema ?? ''}
                        onChange={(e) => updateItem(item.id_repuesto, 'cantidad_sistema', e.target.value)}
                        className="text-center h-9 w-16 mx-auto"
                        placeholder="0"
                      />
                    </div>
                    {/* Real Input */}
                    <div className="text-center">
                      <p className="md:hidden text-xs font-semibold text-muted-foreground">Real</p>
                      <Input
                        type="number"
                        value={item.real ?? ''}
                        onChange={(e) => updateItem(item.id_repuesto, 'real', e.target.value)}
                        className="text-center h-9 w-16 mx-auto"
                        placeholder="0"
                      />
                    </div>
                    {/* PQ Input */}
                    <div className="text-center">
                      <p className="md:hidden text-xs font-semibold text-muted-foreground">PQ</p>
                      <Input
                        type="number"
                        value={item.pq ?? ''}
                        onChange={(e) => updateItem(item.id_repuesto, 'pq', e.target.value)}
                        className="text-center h-9 w-16 mx-auto"
                        placeholder="0"
                      />
                    </div>
                    {/* Difference */}
                    <div className="text-center">
                      <p className="md:hidden text-xs font-semibold text-muted-foreground">Diferencia</p>
                      <p className={`font-bold text-sm ${item.diferencia && item.diferencia < 0 ? 'text-destructive' : ''}`}>
                        {item.diferencia ?? 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={isLoading || isError || mutation.isPending}>
            {mutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
