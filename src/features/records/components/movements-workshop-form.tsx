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
import { useState } from "react";

export default function MovementsWorkshopForm() {
  const [valueSlider, setValueSlider] = useState<number[]>([1]);
  const {
    handleCreateMovement,
    isProcessing,
    selected,
    setSelected,
    setItemName,
  } = useMovements();
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Movimiento taller</CardTitle>
        <CardDescription>
          Registra el movimiento de tus repuestos en el taller
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="md:grid md:grid-cols-5 md:gap-4 flex flex-col gap-4">
            <div className="grid gap-2 col-span-2">
              <Label htmlFor="email">Orden</Label>
              <Input id="email" type="email" placeholder="999999" required />
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
                    {valueSlider}
                  </span>
                </Label>
              </div>
              <Slider
                value={valueSlider}
                onValueChange={setValueSlider}
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
                <Button type="button" variant="outline" className="col-start-1">
                  Salida
                </Button>
                <Button type="button" variant="outline" className="col-start-2">
                  Ingreso
                </Button>
                <Button type="button" variant="outline" className="col-start-3">
                  Venta
                </Button>
              </ButtonGroup>
              <Button type="button" className="w-full" variant="outline">
                Cotizacion
              </Button>
              <Button type="button" className="w-full" variant="outline">
                Prestamo
              </Button>
              <Button type="button" className="w-full" variant="outline">
                Garantia
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Crear registro
        </Button>
      </CardFooter>
    </Card>
  );
}
