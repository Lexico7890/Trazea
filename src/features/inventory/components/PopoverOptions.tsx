import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Ellipsis } from "lucide-react";



export function PopoverOptions() {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="ml-auto">
                    <Ellipsis className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[160px]">
                <div className="flex flex-col gap-2">
                    <Button variant="ghost">Solicitar</Button>
                    <Button variant="ghost">Enviar a Taller</Button>
                    <Button variant="ghost" className="text-destructive">Descontinuar</Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

