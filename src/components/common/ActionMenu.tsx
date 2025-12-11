import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Ellipsis } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ActionItem {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    className?: string; // For styling specific actions (e.g., destructive)
}

interface ActionMenuProps {
    actions: ActionItem[];
}

export function ActionMenu({ actions }: ActionMenuProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Ellipsis className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" align="end">
                <div className="flex flex-col gap-1">
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            variant="ghost"
                            className={cn("justify-start font-normal h-8 px-2", action.className)}
                            onClick={() => {
                                action.onClick();
                                // Optional: Close popover here if needed, but PopoverContent usually handles outside clicks.
                                // If we need to programmatically close, we might need to control the Popover state.
                                // For now, we'll assume the action might navigate or open a modal which is fine.
                                // If it's a simple action, we might want to close the popover.
                                // But the shadcn popover isn't controlled here.
                                // We can leave it as is for standard behavior.
                            }}
                            disabled={action.disabled}
                        >
                            {action.icon && <span className="mr-2 h-4 w-4 flex items-center justify-center">{action.icon}</span>}
                            {action.label}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
