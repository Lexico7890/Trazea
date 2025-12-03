import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Ellipsis } from "lucide-react";
import type { InventoryItem } from "../types";
import { useRequestsStore } from "@/features/requests/store/useRequestsStore";
import { toast } from "sonner";

interface PopoverOptionsProps {
    item: InventoryItem;
}

export function PopoverOptions({ item }: PopoverOptionsProps) {
    const { addItem } = useRequestsStore();

    const handleSolicitar = () => {
        addItem({
            id: item.id_repuesto,
            nombre: item.nombre,
            referencia: item.referencia,
        });
        toast.success(`"${item.nombre}" agregado a solicitudes`);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Ellipsis className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[160px]" align="end">
                <div className="flex flex-col gap-1">
                    <Button
                        variant="ghost"
                        className="justify-start font-normal"
                        onClick={handleSolicitar}
                        disabled={item.descontinuado}
                    >
                        Solicitar
                    </Button>
                    <Button variant="ghost" className="justify-start font-normal">
                        Enviar a Taller
                    </Button>
                    <Button variant="ghost" className="justify-start font-normal text-destructive hover:text-destructive">
                        Descontinuar
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
