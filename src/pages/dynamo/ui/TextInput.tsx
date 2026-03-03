import { Loader2, Send } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/utils";

type QueryMode = "sql" | "rag";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  queryMode: QueryMode;
  onQueryModeChange: (mode: QueryMode) => void;
  isProcessing: boolean;
}

export function TextInput({
  value,
  onChange,
  onSubmit,
  queryMode,
  onQueryModeChange,
  isProcessing,
}: TextInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl px-4 flex flex-col gap-4">
      <div className="bg-muted/30 rounded-3xl border border-border p-2 md:p-3 space-y-3">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="¿Qué deseas consultar?"
          className="min-h-[120px] md:min-h-[140px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base md:text-lg p-2"
          disabled={isProcessing}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-muted/50 border border-border">
            <button
              onClick={() => onQueryModeChange("sql")}
              className={cn(
                "text-xs font-medium px-3 py-1 rounded-full transition-all",
                queryMode === "sql" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              REG
            </button>
            <button
              onClick={() => onQueryModeChange("rag")}
              className={cn(
                "text-xs font-medium px-3 py-1 rounded-full transition-all",
                queryMode === "rag" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              DOC
            </button>
          </div>
          <Button
            onClick={onSubmit}
            disabled={!value.trim() || isProcessing}
            size="sm"
            className="rounded-full px-4 bg-red-500 hover:bg-red-600"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Enviar
          </Button>
        </div>
      </div>
      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Procesando tu consulta...</span>
        </div>
      )}
    </div>
  );
}
