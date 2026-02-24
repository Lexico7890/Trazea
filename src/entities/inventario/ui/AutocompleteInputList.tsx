import { CircleX } from "lucide-react";
import { AutocompleteInput } from "./AutocompleteInput";
import type { SparePart } from "@/shared/model";
import { Label } from "@/shared/ui/label";
import { Slider } from "@/shared/ui/slider";
import { Separator } from "@/shared/ui/separator";

interface AutocompleteInputListProps {
  selectedParts: SparePart[];
  setSelectedParts: (parts: SparePart[]) => void;
  locationId: string | undefined;
}

export function AutocompleteInputList({
  selectedParts,
  setSelectedParts,
  locationId
}: AutocompleteInputListProps) {
  const handleSelect = (part: SparePart | null) => {
    if (!part) return;
    if (selectedParts.some((p) => p.id_repuesto === part.id_repuesto)) {
      return;
    }
    setSelectedParts([...selectedParts, { ...part, cantidad: 1 }]);
  };

  return (
    <div className="flex flex-col gap-2">
      <h1>Repuestos</h1>
      <AutocompleteInput
        setSelected={handleSelect}
        selected={null}
        id_localizacion={locationId}
        showBadge={false}
        clearInput={true}
      />
      <div>
        {selectedParts.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay repuestos seleccionados.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {selectedParts.map((part) => (
              <li
                className="text-sm bg-yellow-600/30 border border-yellow-600 rounded-md p-2 flex flex-col gap-2"
                key={part.id_repuesto}
              >
                <div className="flex justify-between items-center">
                  <span>{part.nombre}</span>{" "}
                  <CircleX
                    size={20}
                    className="cursor-pointer hover:text-red-600"
                    onClick={() => {
                      setSelectedParts(
                        selectedParts.filter(
                          (p) => p.id_repuesto !== part.id_repuesto,
                        ),
                      );
                    }}
                  />
                </div>
                <div className="relative py-2">
                    <Separator className="absolute bg-gray-600"/>
                    <Label htmlFor={`quantity-${part.id_repuesto}`} className="absolute -bottom-0.5 left-2/5 text-xs p-0.5 text-gray-400 bg-gray-600">
                        Cantidad
                    </Label>
                </div>
                <div className="flex justify-center items-center gap-1.5">
                  <div className="flex items-center">
                    <Label htmlFor="quantity">
                      <span className="text-yellow-400 font-bold">
                        {part.cantidad}
                      </span>
                    </Label>
                  </div>
                  <Slider
                    value={[part.cantidad || 1]}
                    onValueChange={(value) => {
                      setSelectedParts(
                        selectedParts.map((p) =>
                          p.id_repuesto === part.id_repuesto ? { ...p, cantidad: value[0] } : p,
                        ),
                      );
                    }}
                    max={20}
                    step={1}
                    min={1}
                    id="quantity"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
