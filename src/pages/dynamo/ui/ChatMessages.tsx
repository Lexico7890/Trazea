import { useRef, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { ChatMessageBubble } from "./ChatMessageBubble";
import type { ChatMessage } from "../model/types";

interface ChatMessagesProps {
  messages: ChatMessage[];
  onSelectOption: (messageId: string, optionId: string, optionLabel: string) => void;
  isProcessing: boolean;
}

export function ChatMessages({
  messages,
  onSelectOption,
  isProcessing,
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al fondo cuando llegan nuevos mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground p-4">
        <MessageSquare className="w-10 h-10 opacity-30" />
        <p className="text-sm text-center">
          Las respuestas del asistente aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <ChatMessageBubble
          key={message.id}
          message={message}
          onSelectOption={(optionId, optionLabel) =>
            onSelectOption(message.id, optionId, optionLabel)
          }
          isProcessing={isProcessing}
        />
      ))}
    </div>
  );
}
