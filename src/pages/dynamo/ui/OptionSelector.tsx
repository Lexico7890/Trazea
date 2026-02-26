import { cn } from "@/shared/lib/utils";
import { Check } from "lucide-react";
import type { AgentOption } from "../model/types";

interface OptionSelectorProps {
  options: AgentOption[];
  selectedOption?: string;
  onSelect: (optionId: string, optionLabel: string) => void;
  disabled: boolean;
}

export function OptionSelector({
  options,
  selectedOption,
  onSelect,
  disabled,
}: OptionSelectorProps) {
  return (
    <div className="w-full space-y-2">
      <p className="text-xs text-muted-foreground font-medium">
        Selecciona una opción:
      </p>
      <div className="space-y-1.5">
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          return (
            <button
              key={option.id}
              onClick={() => !disabled && onSelect(option.id, option.nombre)}
              disabled={disabled}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg border text-sm",
                "transition-all duration-200",
                isSelected
                  ? "border-red-500 bg-red-500/10 text-foreground"
                  : "border-border bg-background hover:border-red-500/50 hover:bg-red-500/5",
                disabled && !isSelected && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{option.nombre}</p>
                  {option.descripcion && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {option.descripcion}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-red-500 shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
