import { Button } from "@/shared/ui/button";
import { ButtonGroup } from "@/shared/ui/button-group";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { BrushCleaning } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Slider } from "@/shared/ui/slider";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { ActionButtonGroup, TIPY_CONCEPT } from "../constants";
import { useUserStore } from "@/entities/user";
import { useTechnicians } from "@/entities/technical";
import { useRecordsStore } from "@/entities/records";
import { useTechnicalMovements } from "../lib/useTechnicalMovement";
import { AutocompleteInput } from "@/widgets/auto-complete-input";

export function MovementsWorkshopForm() {
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [countItems, setCountItems] = useState<number>(1);
  const [actionButtonGroup, setActionButtonGroup] = useState<ActionButtonGroup>(
    ActionButtonGroup.SALIDA
  );
  const [movementConcept, setMovementConcept] = useState<TIPY_CONCEPT | null>(
    null
  );
  const [selected, setSelected] = useState<{ id_repuesto: string, referencia: string, nombre: string } | null>(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("");

  const { sessionData } = useUserStore();
  const locationId = sessionData?.locations?.[0]?.id_localizacion;

  const { data: technicians } = useTechnicians(locationId);
  const { movementToEdit, setMovementToEdit } = useRecordsStore();

  const { handleCreateTechnicalMovement, isProcessing: isTechnicalProcessing } = useTechnicalMovements();

  useEffect(() => {
    if (!movementToEdit) return;

    // Intentionally syncing form state with external edit data
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrderNumber(movementToEdit.numero_orden || "");
     
    setCountItems(movementToEdit.cantidad || 1);

    // Map 'tipo' string to ActionButtonGroup enum if possible
    // Assuming movementToEdit.tipo matches the enum values
    if (Object.values(ActionButtonGroup).includes(movementToEdit.tipo as ActionButtonGroup)) {
       
      setActionButtonGroup(movementToEdit.tipo as ActionButtonGroup);
    }

    // Map 'concepto'
    // Assuming movementToEdit.concepto matches TIPY_CONCEPT
    if (Object.values(TIPY_CONCEPT).includes(movementToEdit.concepto as TIPY_CONCEPT)) {
       
      setMovementConcept(movementToEdit.concepto as TIPY_CONCEPT);
    }
    if (movementToEdit.id_repuesto && movementToEdit.repuesto_nombre) {
       
      setSelected({
        id_repuesto: movementToEdit.id_repuesto,
        referencia: movementToEdit.repuesto_referencia || "",
        nombre: movementToEdit.repuesto_nombre
      });
    }

    if (movementToEdit.id_tecnico_asignado) {
       
      setSelectedTechnicianId(movementToEdit.id_tecnico_asignado);
    }
  }, [movementToEdit]);

  const handleClear = () => {
    setSelected(null);
    setActionButtonGroup(ActionButtonGroup.SALIDA);
    setMovementConcept(null);
    setOrderNumber("");
    setCountItems(1);
    setSelectedTechnicianId("");
    setMovementToEdit(null);
  };

  const submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validatedOrderNumber = typeof orderNumber !== 'string' ? String(orderNumber) : orderNumber;

    if (!selectedTechnicianId) {
      toast.info("Debe seleccionar un técnico");
      return;
    }

    if (
      actionButtonGroup === ActionButtonGroup.SALIDA ||
      actionButtonGroup === ActionButtonGroup.INGRESO
    ) {
      if (!movementConcept) {
        toast.info("Debe seleccionar un concepto de movimiento para salida o ingreso");
        return;
      }
    }
    if (actionButtonGroup !== ActionButtonGroup.VENTA) {
      if (!validatedOrderNumber.trim()) {
        toast.info("Debe ingresar un número de orden");
        return;
      }
    }

    if (!selected) {
      toast.info("Debe seleccionar un repuesto");
      return;
    }
    if (countItems <= 0) {
      toast.info("La cantidad debe ser mayor a 0");
      return;
    }
    
    const movementData = {
      id_localizacion: locationId,
      id_usuario_responsable: sessionData?.user?.id,
      id_tecnico_asignado: selectedTechnicianId,
      id_repuesto: selected?.id_repuesto,
      concepto: (actionButtonGroup === ActionButtonGroup.VENTA ? TIPY_CONCEPT.VENTA : movementConcept) || undefined,
      tipo: actionButtonGroup,
      cantidad: countItems,
      numero_orden: validatedOrderNumber || "",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handleCreateTechnicalMovement(movementData as any);

    // Clear form and edit state
    setSelected(null);
    setActionButtonGroup(ActionButtonGroup.SALIDA);
    setMovementConcept(null);
    setOrderNumber("");
    setCountItems(1);
    setSelectedTechnicianId("");
    setMovementToEdit(null);
  };
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{movementToEdit ? "Editar movimiento" : "Movimiento taller"}</CardTitle>
        <CardDescription>
          {movementToEdit
            ? "Edita los detalles del movimiento (se creará un nuevo registro)"
            : "Registra el movimiento de tus repuestos en el taller"}
        </CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
            type="button"
          >
            <BrushCleaning className="h-4 w-4" />
            <span className="sr-only">Limpiar formulario</span>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitForm}>
          <div className="md:grid md:grid-cols-5 md:gap-4 flex flex-col gap-2 sm:gap-4">
            <div className="grid gap-2 col-span-5">
              <Label htmlFor="technician">Técnico</Label>
              <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar técnico" />
                </SelectTrigger>
                <SelectContent>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {technicians?.map((tech: any) => (
                    <SelectItem key={tech.id_usuario} value={tech.id_usuario}>
                      {tech.nombre_usuario}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 col-span-2">
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                type="text"
                placeholder="999999"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </div>
            <div className="grid gap-2 col-span-3">
              <div className="flex items-center">
                <Label htmlFor="password">Repuesto</Label>
              </div>
              <AutocompleteInput
                setSelected={setSelected}
                selected={selected}
                id_localizacion={locationId}
              />
            </div>
            <div className="grid gap-4 col-span-5">
              <div className="flex items-center">
                <Label htmlFor="quantity">
                  Cantidad:{" "}
                  <span className="text-green-400 font-bold">
                    {countItems}
                  </span>
                </Label>
              </div>
              <Slider
                value={[countItems]}
                onValueChange={(value) => setCountItems(value[0])}
                max={50}
                step={1}
                min={1}
                id="quantity"
              />
            </div>
            <div className="grid gap-2 col-span-5">
              <Label htmlFor="notes" className="flex justify-center text-md">
                Concepto
              </Label>
              <ButtonGroup className="grid grid-cols-3 w-full justify-center">
                <Button
                  type="button"
                  variant={
                    actionButtonGroup === ActionButtonGroup.SALIDA
                      ? "default"
                      : "outline"
                  }
                  className={
                    actionButtonGroup === ActionButtonGroup.SALIDA
                      ? "bg-red-600 hover:bg-red-500 text-white"
                      : "hover:bg-green-50"
                  }
                  onClick={() => setActionButtonGroup(ActionButtonGroup.SALIDA)}
                >
                  Salida
                </Button>
                <Button
                  type="button"
                  variant={
                    actionButtonGroup === ActionButtonGroup.INGRESO
                      ? "default"
                      : "outline"
                  }
                  className={
                    actionButtonGroup === ActionButtonGroup.INGRESO
                      ? "bg-red-600 hover:bg-red-500 text-white"
                      : "hover:bg-red-50"
                  }
                  onClick={() =>
                    setActionButtonGroup(ActionButtonGroup.INGRESO)
                  }
                >
                  Ingreso
                </Button>
                <Button
                  type="button"
                  variant={
                    actionButtonGroup === ActionButtonGroup.VENTA
                      ? "default"
                      : "outline"
                  }
                  className={
                    actionButtonGroup === ActionButtonGroup.VENTA
                      ? "bg-red-600 hover:bg-red-500 text-white"
                      : "hover:bg-blue-50"
                  }
                  onClick={() => setActionButtonGroup(ActionButtonGroup.VENTA)}
                >
                  Venta
                </Button>
              </ButtonGroup>
              <Button
                type="button"
                variant={
                  movementConcept === TIPY_CONCEPT.COTIZACION
                    ? "default"
                    : "outline"
                }
                className={
                  movementConcept === TIPY_CONCEPT.COTIZACION
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "hover:bg-blue-50"
                }
                onClick={() => setMovementConcept(TIPY_CONCEPT.COTIZACION)}
              >
                Cotizacion
              </Button>
              <Button
                type="button"
                variant={
                  movementConcept === TIPY_CONCEPT.PRESTAMO
                    ? "default"
                    : "outline"
                }
                className={
                  movementConcept === TIPY_CONCEPT.PRESTAMO
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "hover:bg-blue-50"
                }
                onClick={() => setMovementConcept(TIPY_CONCEPT.PRESTAMO)}
              >
                Prestamo
              </Button>
              <Button
                type="button"
                variant={
                  movementConcept === TIPY_CONCEPT.GARANTIA
                    ? "default"
                    : "outline"
                }
                className={
                  movementConcept === TIPY_CONCEPT.GARANTIA
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "hover:bg-blue-50"
                }
                onClick={() => setMovementConcept(TIPY_CONCEPT.GARANTIA)}
              >
                Garantia
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Button type="submit" className="w-full" disabled={isTechnicalProcessing}>
              {isTechnicalProcessing ? "Procesando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2"></CardFooter>
    </Card>
  );
}
