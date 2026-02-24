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
import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { ActionButtonGroup, TIPY_CONCEPT } from "../constants";
import { useUserStore } from "@/entities/user";
import { useTechnicians } from "@/entities/technical";
import { useRecordsStore } from "@/entities/records";
import { useTechnicalMovements } from "../lib/useTechnicalMovement";
import { AutocompleteInputList } from "@/entities/inventario";
import type { SparePart } from "@/shared/model";

export function MovementsWorkshopForm() {
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [actionButtonGroup, setActionButtonGroup] = useState<ActionButtonGroup>(
    ActionButtonGroup.SALIDA,
  );
  const [movementConcept, setMovementConcept] = useState<TIPY_CONCEPT | null>(
    null,
  );
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("");
  const [selectedParts, setSelectedParts] = useState<SparePart[]>([]);

  const { sessionData } = useUserStore();
  const locationId = sessionData?.locations?.[0]?.id_localizacion;

  const { data: technicians } = useTechnicians(locationId);
  const { movementToEdit, setMovementToEdit } = useRecordsStore();

  const { handleCreateTechnicalMovement, isProcessing: isTechnicalProcessing } =
    useTechnicalMovements();

  const handleClear = () => {
    setActionButtonGroup(ActionButtonGroup.SALIDA);
    setMovementConcept(null);
    setOrderNumber("");
    setSelectedTechnicianId("");
    setSelectedParts([]);
    setMovementToEdit(null);
  };

  const submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validatedOrderNumber =
      typeof orderNumber !== "string" ? String(orderNumber) : orderNumber;

    if (!selectedTechnicianId) {
      toast.info("Debe seleccionar un técnico");
      return;
    }

    if (
      actionButtonGroup === ActionButtonGroup.SALIDA ||
      actionButtonGroup === ActionButtonGroup.INGRESO
    ) {
      if (!movementConcept) {
        toast.info(
          "Debe seleccionar un concepto de movimiento para salida o ingreso",
        );
        return;
      }
    }
    if (actionButtonGroup !== ActionButtonGroup.VENTA) {
      if (!validatedOrderNumber.trim()) {
        toast.info("Debe ingresar un número de orden");
        return;
      }
    }

    if (selectedParts.length === 0) {
      toast.info("Debe seleccionar un repuesto");
      return;
    }

    const movementData = {
      repuestos: selectedParts,
      id_localizacion: locationId,
      id_usuario_responsable: sessionData?.user?.id,
      id_tecnico_asignado: selectedTechnicianId,
      concepto:
        (actionButtonGroup === ActionButtonGroup.VENTA
          ? TIPY_CONCEPT.VENTA
          : movementConcept) || undefined,
      tipo: actionButtonGroup,
      numero_orden: validatedOrderNumber || "",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handleCreateTechnicalMovement(movementData as any);

    // Clear form and edit state
    handleClear();
  };
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>
          {movementToEdit ? "Editar movimiento" : "Movimiento taller"}
        </CardTitle>
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
              <Select
                value={selectedTechnicianId}
                onValueChange={setSelectedTechnicianId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar técnico" />
                </SelectTrigger>
                <SelectContent>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {technicians?.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">
                      No hay técnicos disponibles para esta ubicación
                    </div>
                  ) : (
                    technicians?.map(
                      (tech: {
                        id_usuario: string;
                        nombre_usuario: string;
                      }) => (
                        <SelectItem
                          key={tech.id_usuario}
                          value={tech.id_usuario}
                        >
                          {tech.nombre_usuario}
                        </SelectItem>
                      ),
                    )
                  )}
                  <div className="p-2 text-sm text-gray-500"></div>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-5">
              <AutocompleteInputList
                selectedParts={selectedParts}
                setSelectedParts={setSelectedParts}
                locationId={locationId}
              />
            </div>
            <div className="grid gap-2 col-span-5">
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                type="text"
                placeholder="999999"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
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
            <Button
              type="submit"
              className="w-full"
              disabled={isTechnicalProcessing}
            >
              {isTechnicalProcessing ? "Procesando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2"></CardFooter>
    </Card>
  );
}
