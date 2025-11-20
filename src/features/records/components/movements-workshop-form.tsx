import AutocompleteInput from "@/components/AutocompleteImput";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useMovements } from "@/hooks/useMovements";
import { ActionsMovements } from "@/types/movement";
import { useState } from "react";
import type { FormEvent } from "react";

const enum ActionButtonGroup {
  SALIDA = "salida",
  INGRESO = "ingreso",
  VENTA = "venta",
}

const enum MovementConcept {
  COTIZACION = "cotizacion",
  PRESTAMO = "prestamo",
  GARANTIA = "garantia",
  VENTA = "venta",
}

export default function MovementsWorkshopForm() {
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [countItems, setCountItems] = useState<number>(1);
  const [actionButtonGroup, setActionButtonGroup] = useState<ActionButtonGroup>(
    ActionButtonGroup.SALIDA
  );
  const [movementConcept, setMovementConcept] = useState<MovementConcept>(
    MovementConcept.VENTA
  );

  const [actionSelected, setActionSelected] = useState<ActionsMovements>(
    ActionsMovements.ENTRADA_COTIZACION
  );
  const {
    handleCreateMovement,
    isProcessing,
    selected,
    setSelected,
    setItemName,
  } = useMovements();
  const submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación 1: Si es SALIDA o INGRESO, debe tener un movement concept
    if (
      actionButtonGroup === ActionButtonGroup.SALIDA ||
      actionButtonGroup === ActionButtonGroup.INGRESO
    ) {
      if (!movementConcept) {
        alert("Debe seleccionar un concepto de movimiento para salida o ingreso");
        return;
      }
    }

    // Validación 2: Para todos excepto VENTA, validar orden, repuesto y cantidad
    if (actionButtonGroup !== ActionButtonGroup.VENTA) {
      if (!orderNumber.trim()) {
        alert("Debe ingresar un número de orden");
        return;
      }
      if (!selected) {
        alert("Debe seleccionar un repuesto");
        return;
      }
      if (countItems <= 0) {
        alert("La cantidad debe ser mayor a 0");
        return;
      }
    }

    handleCreateMovement(actionSelected, countItems, orderNumber);
    setOrderNumber("");
    setCountItems(1);
  };
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Movimiento taller</CardTitle>
        <CardDescription>
          Registra el movimiento de tus repuestos en el taller
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitForm}>
          <div className="md:grid md:grid-cols-5 md:gap-4 flex flex-col gap-4">
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
                onSelect={setItemName}
                selected={selected}
                setSelected={setSelected}
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
                  movementConcept === MovementConcept.COTIZACION
                    ? "default"
                    : "outline"
                }
                className={
                  movementConcept === MovementConcept.COTIZACION
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "hover:bg-blue-50"
                }
                onClick={() => setMovementConcept(MovementConcept.COTIZACION)}
              >
                Cotizacion
              </Button>
              <Button
                type="button"
                variant={
                  movementConcept === MovementConcept.PRESTAMO
                    ? "default"
                    : "outline"
                }
                className={
                  movementConcept === MovementConcept.PRESTAMO
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "hover:bg-blue-50"
                }
                onClick={() => setMovementConcept(MovementConcept.PRESTAMO)}
              >
                Prestamo
              </Button>
              <Button
                type="button"
                variant={
                  movementConcept === MovementConcept.GARANTIA
                    ? "default"
                    : "outline"
                }
                className={
                  movementConcept === MovementConcept.GARANTIA
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "hover:bg-blue-50"
                }
                onClick={() => setMovementConcept(MovementConcept.GARANTIA)}
              >
                Garantia
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? "Procesando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2"></CardFooter>
    </Card>
  );
}
