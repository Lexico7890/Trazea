import { Button } from "@/shared/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import { Badge } from "@/shared/ui/badge";
import type { Guarantee } from "@/entities/guarantees";

interface SparePartsPopoverProps {
  items: Guarantee[];
  repuestosCount: number;
}

export function SparePartsPopover({ items, repuestosCount }: SparePartsPopoverProps) {

  const firstItem = items[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent hover:text-primary flex flex-col items-start">
          <div className="flex items-center gap-2">
            <span className="font-medium">{firstItem?.referencia_repuesto}</span>
            {repuestosCount > 1 && (
              <Badge variant="secondary" className="text-[10px] bg-red-600/30">
                +{repuestosCount - 1}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{firstItem?.nombre_repuesto}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="bg-muted/50 p-3 border-b">
          <h4 className="font-semibold text-sm">Repuestos ({repuestosCount})</h4>
        </div>
        <div className="max-h-60 overflow-y-auto p-2">
          {items.map((item: Guarantee, idx: number) => (
            <div key={idx} className="p-2 hover:bg-muted/30 rounded-md text-sm">
              <div className="font-medium">{item.referencia_repuesto}</div>
              <div className="text-xs text-muted-foreground">{item.nombre_repuesto}</div>
              {item.motivo_falla && (
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="font-semibold">Falla:</span> {item.motivo_falla}
                </div>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
