import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Ellipsis, Edit, Eye } from "lucide-react";

interface ActionMenuProps {
    onEdit?: () => void;
    onView?: () => void;
    editLabel?: string;
    viewLabel?: string;
}

export function ActionMenu({
    onEdit,
    onView,
    editLabel = "Editar",
    viewLabel = "Ver"
}: ActionMenuProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Ellipsis className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" align="end">
                <div className="flex flex-col gap-1">
                    <Button
                        variant="ghost"
                        className="justify-start font-normal h-8 px-2"
                        onClick={onEdit}
                        disabled={!onEdit}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        {editLabel}
                    </Button>
                    <Button
                        variant="ghost"
                        className="justify-start font-normal h-8 px-2"
                        onClick={onView}
                        disabled={true} // Disabled as requested
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        {viewLabel}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
