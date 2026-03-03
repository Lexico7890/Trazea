import { useState, useEffect } from "react";
import { RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { useIsMobile } from "@/shared/lib/use-mobile";
import { useVoiceAgent } from "../lib/useVoiceAgent";
import { useDynamoStore } from "../model/useDynamoStore";
import { ModeSwitch, HeaderTitle } from "./ModeSwitch";
import { TextInput } from "./TextInput";
import { AudioInput } from "./AudioInput";
import { ChatPanel } from "./ChatPanel";

type Mode = "audio" | "text";
type QueryMode = "sql" | "rag";

export function DynamoPage() {
  const {
    isListening,
    isProcessing,
    isSpeaking,
    isIdle,
    transcript,
    lastResponse,
    error,
    isSupported,
    startListening,
    stopListening,
    cancelSpeaking,
    clearError,
    resetSession,
    processText,
  } = useVoiceAgent();

  const {
    messages,
    isPanelOpen,
    hasUnread,
    togglePanel,
    setPanelOpen,
    updateMessageSelection,
  } = useDynamoStore();

  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("audio");
  const [textInput, setTextInput] = useState("");
  const [queryMode, setQueryMode] = useState<QueryMode>("sql");

  const isDisabled = isProcessing || isSpeaking || !isSupported;

  useEffect(() => {
    if (!isMobile && messages.length > 0 && !isPanelOpen) {
      setPanelOpen(true);
    }
  }, [messages.length > 0]);

  const handleSelectOption = async (
    messageId: string,
    optionId: string,
    optionLabel: string
  ) => {
    updateMessageSelection(messageId, optionId);
    await processText(optionLabel, queryMode);
  };

  const handleChatToggle = () => {
    if (isMobile) {
      setIsDrawerOpen(true);
    } else {
      togglePanel();
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim() || isProcessing) return;
    const input = textInput.trim();
    setTextInput("");
    await processText(input, queryMode);
  };

  const getButtonText = () => {
    if (!isSupported) return "Navegador no compatible";
    if (isListening) return "Escuchando...";
    if (isProcessing) return "Procesando...";
    if (isSpeaking) return "Reproduciendo...";
    return "Presiona para hablar";
  };

  const getStatusText = () => {
    if (!isSupported) return "Tu navegador no soporta las APIs de voz";
    if (error) return error.message;
    if (isListening) return transcript || "Escuchando tu voz...";
    if (isProcessing) return "Procesando tu consulta...";
    if (isSpeaking) return "Reproduciendo respuesta...";
    return "Listo para escuchar";
  };

  return (
    <div className="flex h-[calc(100dvh-6rem)] overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 relative min-w-0">
        <ModeSwitch
          mode={mode}
          onModeChange={setMode}
          messagesLength={messages.length}
          hasUnread={hasUnread}
          onChatToggle={handleChatToggle}
          isMobile={isMobile}
          isPanelOpen={isPanelOpen}
        />

        <HeaderTitle mode={mode} isSupported={isSupported} />

        {mode === "text" ? (
          <TextInput
            value={textInput}
            onChange={setTextInput}
            onSubmit={handleTextSubmit}
            queryMode={queryMode}
            onQueryModeChange={setQueryMode}
            isProcessing={isProcessing}
          />
        ) : (
          <>
            <AudioInput
              isListening={isListening}
              isProcessing={isProcessing}
              isSpeaking={isSpeaking}
              isSupported={isSupported}
              transcript={transcript || ""}
              error={error}
              onClearError={clearError}
            />

            <button
              onClick={() => {
                if (isMobile) return;
                if (isListening) {
                  stopListening();
                } else if (!isProcessing && !isSpeaking) {
                  startListening();
                }
              }}
              onTouchStart={(e) => {
                if (!isMobile || isDisabled) return;
                e.preventDefault();
                if (!isListening && !isProcessing && !isSpeaking) {
                  startListening();
                }
              }}
              onTouchEnd={(e) => {
                if (!isMobile) return;
                e.preventDefault();
                if (isListening) {
                  stopListening();
                }
              }}
              disabled={isDisabled}
              className={cn(
                "relative px-8 py-4 rounded-full font-semibold text-white",
                "bg-linear-to-r from-red-500 via-red-600 to-red-700",
                "shadow-lg shadow-red-500/25",
                "transition-all duration-200 ease-out",
                "select-none touch-none",
                "hover:shadow-xl hover:shadow-red-500/30",
                "active:scale-95",
                isListening && "scale-95 shadow-inner bg-red-800",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="flex items-center gap-2">
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isSpeaking ? (
                  <span className="animate-pulse">🎤</span>
                ) : (
                  <span>🎤</span>
                )}
                {isMobile && !isDisabled && isIdle ? "Mantén para hablar" : getButtonText()}
              </span>
            </button>

            {isSpeaking && (
              <Button variant="outline" size="sm" onClick={cancelSpeaking} className="text-muted-foreground">
                Cancelar reproducción
              </Button>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div
                className={cn(
                  "w-2 h-2 rounded-full transition-colors duration-300",
                  error
                    ? "bg-destructive"
                    : isListening
                      ? "bg-red-500 animate-pulse"
                      : isProcessing
                        ? "bg-yellow-500 animate-pulse"
                        : isSpeaking
                          ? "bg-green-500 animate-pulse"
                          : "bg-muted-foreground/50"
                )}
              />
              <span className="max-w-xs truncate">{getStatusText()}</span>
            </div>

            {(lastResponse || error) && isIdle && (
              <Button variant="ghost" size="sm" onClick={resetSession} className="text-muted-foreground gap-2">
                <RotateCcw className="w-4 h-4" />
                Nueva conversación
              </Button>
            )}
          </>
        )}
      </div>

      <ChatPanel
        messages={messages}
        isPanelOpen={isPanelOpen}
        isDrawerOpen={isDrawerOpen}
        onPanelOpenChange={setPanelOpen}
        onDrawerOpenChange={setIsDrawerOpen}
        onResetSession={resetSession}
        isProcessing={isProcessing}
        onSelectOption={handleSelectOption}
      />
    </div>
  );
}
