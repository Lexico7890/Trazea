import type { InventoryItem } from "@/entities/inventario";

export interface InventoryEditSheetProps {
    item: InventoryItem;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaveSuccess: () => void;
}

export type ActionType = "solicitar" | "taller" | null;