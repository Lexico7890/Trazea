import { ActionsMovements } from "@/types/movement";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateMovement } from "./useMovementsQuery";

export const useMovements = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const [itemName, setItemName] = useState<{ id: string; name: string }>({
    id: "",
    name: "",
  });

  // Use React Query mutation
  const createMovementMutation = useCreateMovement();

  const handleCreateMovement = async (
    actionSelected: ActionsMovements,
    countItems: number,
    orderNumber?: string,
    notes?: string,
    fromLocationId?: number,
    toLocationId?: number
  ) => {
    if (!itemName.id) {
      console.error("No se ha seleccionado un Item ID para el movimiento.");
      toast.error("Por favor, selecciona un ítem antes de continuar.");
      return;
    }

    try {
      const result = await createMovementMutation.mutateAsync({
        item_id: itemName.id,
        actionSelected,
        countItems,
        orderNumber,
        notes,
        fromLocationId,
        toLocationId,
      });

      // Reset form on success
      setItemName({ id: "", name: "" });
      setSelected(null);

      return result;
    } catch (error) {
      // Error is already handled by the mutation
      console.error("Movement creation failed:", error);
    }
  };

  return {
    handleCreateMovement,
    isProcessing: createMovementMutation.isPending,
    selected,
    setSelected,
    itemName,
    setItemName,
  };
};