import type { ReactNode } from "react";

export interface ActionItem {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    className?: string; // For styling specific actions (e.g., destructive)
}