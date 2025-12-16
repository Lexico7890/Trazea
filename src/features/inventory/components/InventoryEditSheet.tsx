import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import type { InventoryItem } from "../types";
import { updateItemComplete } from "../services";
import { useRequestsStore } from "@/features/requests/store/useRequestsStore";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface InventoryEditSheetProps {
    item: InventoryItem;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaveSuccess: () => void;
}

type ActionType = "solicitar" | "taller" | null;

export function InventoryEditSheet({ item, open, onOpenChange, onSaveSuccess }: InventoryEditSheetProps) {
    const { addItem } = useRequestsStore();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAction, setSelectedAction] = useState<ActionType>(null);

    // Form State (Changed to string | number to handle empty inputs gracefully)
    const [stockActual, setStockActual] = useState<string | number>(item.stock_actual);
    const [posicion, setPosicion] = useState(item.posicion || "");
    const [cantidadMinima, setCantidadMinima] = useState<string | number>(item.cantidad_minima);
    const [tipo, setTipo] = useState(item.tipo || "General");
    const [descontinuado, setDescontinuado] = useState(item.descontinuado);
    const [fechaEstimada, setFechaEstimada] = useState(item.fecha_estimada ? new Date(item.fecha_estimada).toISOString().split('T')[0] : "");

    // Reset form when item changes
    useEffect(() => {
        setStockActual(item.stock_actual);
        setPosicion(item.posicion || "");
        setCantidadMinima(item.cantidad_minima);
        setTipo(item.tipo || "General");
        setDescontinuado(item.descontinuado);
        setFechaEstimada(item.fecha_estimada ? new Date(item.fecha_estimada).toISOString().split('T')[0] : "");
        setSelectedAction(null);
    }, [item, open]);

    const handleSave = async () => {
        // Convert to numbers for comparison and submission
        const finalStockActual = stockActual === "" ? 0 : Number(stockActual);
        const finalCantidadMinima = cantidadMinima === "" ? 0 : Number(cantidadMinima);

        // Validation: Check if any changes were made
        const hasInventoryChanges =
            finalStockActual !== item.stock_actual ||
            posicion !== (item.posicion || "") ||
            finalCantidadMinima !== item.cantidad_minima;

        const hasRepuestoChanges =
            tipo !== (item.tipo || "General") ||
            descontinuado !== item.descontinuado ||
            fechaEstimada !== (item.fecha_estimada ? new Date(item.fecha_estimada).toISOString().split('T')[0] : "");

        const hasAction = selectedAction !== null;

        if (!hasInventoryChanges && !hasRepuestoChanges && !hasAction) {
            toast.info("No hay cambios para guardar");
            return;
        }

        setIsLoading(true);

        try {
            // Update using RPC
            if (hasInventoryChanges || hasRepuestoChanges) {
                // Ensure correct types for RPC
                const fechaEstimadaISO = fechaEstimada ? new Date(fechaEstimada).toISOString() : null;

                await updateItemComplete(
                    String(item.id_inventario), // Ensure UUID string
                    finalStockActual,
                    posicion,
                    finalCantidadMinima,
                    descontinuado,
                    tipo,
                    fechaEstimadaISO
                );
            }

            // Handle Actions
            if (selectedAction === "solicitar") {
                addItem({
                    id: item.id_repuesto,
                    nombre: item.nombre,
                    referencia: item.referencia,
                });
                toast.success(`"${item.nombre}" agregado a solicitudes`);
            } else if (selectedAction === "taller") {
                // Future implementation
                console.log("Enviar a taller - logic pending");
            }

            toast.success("Inventario actualizado correctamente");
            onSaveSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar el inventario");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAction = (action: ActionType) => {
        if (selectedAction === action) {
            setSelectedAction(null);
        } else {
            setSelectedAction(action);
        }
    };

    const handleNumberChange = (value: string, setter: (val: string | number) => void) => {
        if (value === "") {
            setter("");
        } else {
            // Remove leading zeros if present, unless it's just "0"
            const num = Number(value);
            if (!isNaN(num)) {
                setter(value); // Keep string to avoid auto-formatting while typing
            }
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto p-2">
                <SheetHeader>
                    <SheetTitle>Editar Inventario</SheetTitle>
                    <SheetDescription>
                        Modifica los detalles del repuesto o realiza acciones rápidas.
                    </SheetDescription>
                </SheetHeader>

                <div className="grid gap-6">
                    {/* Read-only Info */}
                    <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs text-muted-foreground">Referencia</Label>
                                <p className="text-sm font-medium">{item.referencia}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Estado Stock</Label>
                                <div className="mt-1">
                                    <Badge variant="outline" style={{ backgroundColor: item.estado_stock === 'BAJO' ? 'orange' : item.estado_stock === 'CRITICO' ? 'red' : 'green' }}>
                                        {item.estado_stock}
                                    </Badge>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <Label className="text-xs text-muted-foreground">Nombre</Label>
                                <p className="text-sm font-medium">{item.nombre}</p>
                            </div>
                            <div className="col-span-2">
                                <Label className="text-xs text-muted-foreground">Fecha Ingreso</Label>
                                <p className="text-sm font-medium">
                                    {new Date(item.fecha_ingreso_inventario).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant={selectedAction === "solicitar" ? "default" : "outline"}
                            className="w-full bg-blue-300 hover:bg-blue-400"
                            onClick={() => toggleAction("solicitar")}
                        >
                            Solicitar
                        </Button>
                        <Button
                            variant={selectedAction === "taller" ? "default" : "outline"}
                            className="w-full bg-blue-300 hover:bg-blue-400"
                            onClick={() => toggleAction("taller")}
                        >
                            Enviar a Taller
                        </Button>
                    </div>

                    {/* Editable Fields */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stock Actual</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    value={stockActual}
                                    onChange={(e) => handleNumberChange(e.target.value, setStockActual)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minima">Cantidad Mínima</Label>
                                <Input
                                    id="minima"
                                    type="number"
                                    value={cantidadMinima}
                                    onChange={(e) => handleNumberChange(e.target.value, setCantidadMinima)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="posicion">Posición</Label>
                            <Input
                                id="posicion"
                                value={posicion}
                                onChange={(e) => setPosicion(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tipo">Tipo</Label>
                            <Select value={tipo} onValueChange={setTipo}>
                                <SelectTrigger id="tipo">
                                    <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="General">General</SelectItem>
                                    <SelectItem value="Motor">Motor</SelectItem>
                                    <SelectItem value="Transmision">Transmision</SelectItem>
                                    <SelectItem value="Frenos">Frenos</SelectItem>
                                    <SelectItem value="Suspension">Suspension</SelectItem>
                                    <SelectItem value="Electrico">Electrico</SelectItem>
                                    <SelectItem value="Carroceria">Carroceria</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fecha">Fecha Estimada</Label>
                            <Input
                                id="fecha"
                                type="date"
                                value={fechaEstimada}
                                onChange={(e) => setFechaEstimada(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="descontinuado"
                                checked={descontinuado}
                                onCheckedChange={(checked) => setDescontinuado(checked === true)}
                            />
                            <Label htmlFor="descontinuado" className="font-normal cursor-pointer text-red-300">
                                Descontinuado
                            </Label>
                        </div>
                    </div>
                </div>

                <SheetFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
