import { cn } from "@/shared/lib/utils";
import { User, Bot } from "lucide-react";
import type { ChatMessage } from "../model/types";
import { OptionSelector } from "./OptionSelector";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onSelectOption: (optionId: string, optionLabel: string) => void;
  isProcessing: boolean;
}

export function ChatMessageBubble({
  message,
  onSelectOption,
  isProcessing,
}: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5",
          isUser ? "bg-primary/10" : "bg-red-500/10"
        )}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-primary" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-red-500" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-col gap-1.5 max-w-[85%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "px-3 py-2 rounded-xl text-sm leading-relaxed",
            isUser
              ? "bg-red-600 text-white rounded-tr-sm"
              : "bg-muted rounded-tl-sm"
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Options selector */}
        {message.options && message.options.length > 0 && (
          <OptionSelector
            options={message.options}
            selectedOption={message.selectedOption}
            onSelect={onSelectOption}
            disabled={!!message.selectedOption || isProcessing}
          />
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground px-1">
          {new Date(message.timestamp).toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
