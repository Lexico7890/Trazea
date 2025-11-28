import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface RepuestosFiltersProps {
    search: string;
    tipo: string;
    descontinuado: string;
    onSearchChange: (value: string) => void;
    onTipoChange: (value: string) => void;
    onDescontinuadoChange: (value: string) => void;
    onReset: () => void;
}

export function RepuestosFilters({
    search,
    tipo,
    descontinuado,
    onSearchChange,
    onTipoChange,
    onDescontinuadoChange,
    onReset,
}: RepuestosFiltersProps) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Búsqueda</label>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre o referencia..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="w-full md:w-[200px] space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={tipo} onValueChange={onTipoChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Motor">Motor</SelectItem>
                        <SelectItem value="Transmision">Transmisión</SelectItem>
                        <SelectItem value="Frenos">Frenos</SelectItem>
                        <SelectItem value="Suspension">Suspensión</SelectItem>
                        <SelectItem value="Electrico">Eléctrico</SelectItem>
                        <SelectItem value="Carroceria">Carrocería</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full md:w-[200px] space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select value={descontinuado} onValueChange={onDescontinuadoChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="discontinued">Descontinuados</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button variant="outline" onClick={onReset} className="mb-[2px]">
                <X className="mr-2 h-4 w-4" />
                Limpiar
            </Button>
        </div>
    );
}
