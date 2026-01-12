import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { HelpCircle } from 'lucide-react';

export function ColorLegend() {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="focus:outline-none mt-1">
                    <HelpCircle className="h-6 w-6 text-muted-foreground" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Leyenda de Colores</h4>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-start gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 mt-1" />
                            <p className="text-sm text-muted-foreground">
                                <span className="font-bold text-primary">Rojo:</span> El producto no existe en la base de datos.
                            </p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500 mt-1" />
                            <p className="text-sm text-muted-foreground">
                                <span className="font-bold text-primary">Naranja:</span> El producto no se encontró en la ubicación esperada.
                            </p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1" />
                            <p className="text-sm text-muted-foreground">
                                <span className="font-bold text-primary">Amarillo:</span> Repuestos con diferencias de valores.
                            </p>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
