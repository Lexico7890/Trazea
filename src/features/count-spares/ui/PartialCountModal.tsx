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
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/shared/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import type { CountItem, PartialCountModalProps } from '../model/types';
import { useUserStore } from '@/entities/user';
import { generatePartialCountItems } from '../api';

export function PartialCountModal({ isOpen, onOpenChange }: PartialCountModalProps) {
  const [items, setItems] = useState<CountItem[]>([]);
  const { currentLocation } = useUserStore();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['partialCountItems', currentLocation?.id_localizacion],
    queryFn: () => generatePartialCountItems(currentLocation!.id_localizacion),
    enabled: !!currentLocation && isOpen,
  });

  useEffect(() => {
    if (data) {
      const timeout = setTimeout(() => {
        setItems(data)
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [data]);

  // Refetch data when modal is opened
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);


  const handleRealChange = (id_repuesto: string, value: string) => {
    const numericValue = value === '' ? undefined : parseInt(value, 10);
    setItems(prevItems =>
      prevItems.map(item =>
        item.id_repuesto === id_repuesto ? { ...item, real: numericValue } : item
      )
    );
  };

  const handleSystemChange = (id_repuesto: string, value: string) => {
    const numericValue = value === '' ? undefined : parseInt(value, 10);
    setItems(prevItems =>
      prevItems.map(item =>
        item.id_repuesto === id_repuesto ? { ...item, cantidad_sistema: numericValue } : item
      )
    );
  };
  const handleSave = () => {
    // Placeholder for save logic
    console.log('Saving partial count:', items);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Conteo Parcial</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
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
              <div className="hidden md:grid md:grid-cols-4 gap-4 pb-2 border-b font-semibold text-sm text-muted-foreground">
                <div className="md:col-span-2">Repuesto</div>
                <div className="text-center">CSA</div>
                <div className="text-center">Real</div>
              </div>
              {/* Items List */}
              <div className="divide-y">
                {items.map(item => (
                  <div key={item.id_repuesto} className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 py-3 items-center">
                    {/* Item Info */}
                    <div className="col-span-2 md:col-span-2">
                      <p className="font-bold text-sm">{item.ref_excel}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.nombre}</p>
                    </div>
                    {/* System Quantity */}
                    <div className="text-center">
                      <p className="md:hidden text-xs font-semibold text-muted-foreground">Sistema</p>
                      <Input
                        type="number"
                        value={item.cantidad_sistema ?? ''}
                        onChange={(e) => handleSystemChange(item.id_repuesto, e.target.value)}
                        className="text-center h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-16 mx-auto"
                        placeholder="0"
                      />
                    </div>
                    {/* Real Input */}
                    <div className="text-center">
                      <p className="md:hidden text-xs font-semibold text-muted-foreground">Real</p>
                      <Input
                        type="number"
                        value={item.real ?? ''}
                        onChange={(e) => handleRealChange(item.id_repuesto, e.target.value)}
                        className="text-center h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-16"
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={isLoading || isError}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
