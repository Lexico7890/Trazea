import { Mic, Sparkles, MessageSquare } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

type Mode = "audio" | "text";

interface ModeSwitchProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  messagesLength: number;
  hasUnread: boolean;
  onChatToggle: () => void;
  isMobile: boolean;
  isPanelOpen: boolean;
}

export function ModeSwitch({
  mode,
  onModeChange,
  messagesLength,
  hasUnread,
  onChatToggle,
  isMobile,
  isPanelOpen,
}: ModeSwitchProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 lg:left-auto lg:right-4 lg:translate-x-0">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/80 backdrop-blur-sm border border-border">
        <Mic className={cn("w-3.5 h-3.5", mode === "audio" ? "text-red-500" : "text-muted-foreground")} />
        <button
          onClick={() => onModeChange("audio")}
          className={cn(
            "text-xs font-medium px-2 py-1 rounded-full transition-all",
            mode === "audio" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Audio
        </button>
        <button
          onClick={() => onModeChange("text")}
          className={cn(
            "text-xs font-medium px-2 py-1 rounded-full transition-all",
            mode === "text" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Texto
        </button>
        <Sparkles className={cn("w-3.5 h-3.5", mode === "text" ? "text-red-500" : "text-muted-foreground")} />
      </div>
      {messagesLength > 0 && (
        <button
          onClick={onChatToggle}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-full",
            "bg-muted/80 backdrop-blur-sm border border-border",
            "text-sm text-muted-foreground",
            "hover:bg-muted hover:text-foreground",
            "transition-all duration-200",
            !isMobile && isPanelOpen && "lg:hidden"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Chat</span>
          {hasUnread && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>
      )}
    </div>
  );
}

interface HeaderTitleProps {
  mode: Mode;
  isSupported: boolean;
}

export function HeaderTitle({ mode, isSupported }: HeaderTitleProps) {
  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center gap-3">
        <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
          {mode === "audio" ? "Dynamo" : "Dynamo-text"}
        </h1>
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-500 border-red-500/20"
        >
          Beta
        </Badge>
      </div>
      <p className="text-muted-foreground text-sm md:text-base">
        {isSupported
          ? mode === "audio"
            ? "Solo puedes realizar consultas sobre los documentos cargados"
            : "Puedes consultar la base de datos y los documentos cargados"
          : "Usa Chrome, Edge o Safari para usar esta función"}
      </p>
    </div>
  );
}
