import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Loader2,
  AlertCircle,
  RotateCcw,
  MessageSquare,
  X,
  PanelRightClose,
  Send,
  Sparkles,
  Upload,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer";
import { useIsMobile } from "@/shared/lib/use-mobile";
import { useVoiceAgent } from "../lib/useVoiceAgent";
import { useDynamoStore } from "../model/useDynamoStore";
import { ChatMessages } from "./ChatMessages";
import { toast } from "sonner";
import { supabase } from "@/shared/api";

type Mode = "audio" | "text";

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
  const [isMicHovered, setIsMicHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [queryMode, setQueryMode] = useState<"sql" | "rag">("sql");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDisabled = isProcessing || isSpeaking || !isSupported;
  const isActive = isListening || isProcessing || isSpeaking;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `dynamo-documents/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("imagenes-repuestos-garantias")
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(uploadError.message);
        }
      }
      toast.success(`${files.length} documento(s) subido(s) correctamente`);
    } catch (err) {
      toast.error(`Error al subir documento: ${err instanceof Error ? err.message : "Error desconocido"}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    if (!isMobile && messages.length > 0 && !isPanelOpen) {
      setPanelOpen(true);
    }
  }, [messages.length > 0]);

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

  const StatusIcon = () => {
    if (!isSupported)
      return <MicOff className="w-8 h-8 md:w-10 md:h-10 text-white" />;
    if (isProcessing)
      return (
        <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-white animate-spin" />
      );
    if (isSpeaking)
      return (
        <Volume2 className="w-8 h-8 md:w-10 md:h-10 text-white animate-pulse" />
      );
    return (
      <Mic
        className={cn(
          "w-8 h-8 md:w-10 md:h-10 text-white transition-all duration-200",
          isListening && "animate-pulse"
        )}
      />
    );
  };

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

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const chatContent = (
    <ChatMessages
      messages={messages}
      onSelectOption={handleSelectOption}
      isProcessing={isProcessing}
    />
  );

  return (
    <div className="flex h-[calc(100dvh-6rem)] overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 relative min-w-0">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 lg:left-auto lg:right-4 lg:translate-x-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/80 backdrop-blur-sm border border-border">
            <Mic className={cn("w-3.5 h-3.5", mode === "audio" ? "text-red-500" : "text-muted-foreground")} />
            <button
              onClick={() => setMode("audio")}
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-full transition-all",
                mode === "audio" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Audio
            </button>
            <button
              onClick={() => setMode("text")}
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-full transition-all",
                mode === "text" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Texto
            </button>
            <Sparkles className={cn("w-3.5 h-3.5", mode === "text" ? "text-red-500" : "text-muted-foreground")} />
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleChatToggle}
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

        {mode === "text" ? (
          <div className="w-full max-w-2xl px-4 flex flex-col gap-4">
            <div className="bg-muted/30 rounded-3xl border border-border p-2 md:p-3 space-y-3">
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleTextKeyDown}
                placeholder="¿Qué deseas consultar?"
                className="min-h-[120px] md:min-h-[140px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base md:text-lg p-2"
                disabled={isProcessing}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-muted/50 border border-border">
                  <button
                    onClick={() => setQueryMode("sql")}
                    className={cn(
                      "text-xs font-medium px-3 py-1 rounded-full transition-all",
                      queryMode === "sql" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    REG
                  </button>
                  <button
                    onClick={() => setQueryMode("rag")}
                    className={cn(
                      "text-xs font-medium px-3 py-1 rounded-full transition-all",
                      queryMode === "rag" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    DOC
                  </button>
                </div>
                <Button
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim() || isProcessing}
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
        ) : (
          <>
            <div className="relative flex items-center justify-center h-56 md:h-64">
          {isActive && (
            <>
              <div className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full bg-linear-to-r from-red-500/20 via-red-600/20 to-red-700/20 animate-ping" />
              <div className="absolute w-44 h-44 md:w-56 md:h-56 rounded-full bg-linear-to-r from-red-500/30 via-red-600/30 to-red-700/30 animate-pulse" />
            </>
          )}

          <div
            className={cn(
              "relative w-40 h-40 md:w-52 md:h-52 rounded-full p-1",
              "bg-linear-to-r from-red-500 via-red-600 to-red-700",
              isActive && "animate-spin-slow",
              !isSupported && "opacity-50"
            )}
          >
            <div
              className={cn(
                "w-full h-full rounded-full flex items-center justify-center",
                "bg-background transition-all duration-300",
                isActive &&
                  "bg-linear-to-br from-red-900/50 via-red-800/50 to-red-900/50"
              )}
            >
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <div className="absolute w-20 h-20 md:w-24 md:h-24 rounded-full bg-linear-to-r from-red-500/40 via-red-600/40 to-red-700/40 animate-pulse" />
                )}

                <div
                  className={cn(
                    "relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center",
                    "bg-linear-to-br from-red-500 via-red-600 to-red-700",
                    "shadow-lg shadow-red-500/25",
                    "transition-transform duration-200",
                    isListening && "scale-90"
                  )}
                  onMouseEnter={() => mode === "audio" && setIsMicHovered(true)}
                  onMouseLeave={() => setIsMicHovered(false)}
                >
                  {mode === "audio" && isMicHovered ? (
                    <label htmlFor="document-upload" className="cursor-pointer">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-white animate-spin" />
                      ) : (
                        <Upload className="w-8 h-8 md:w-10 md:h-10 text-white hover:text-red-200" />
                      )}
                    </label>
                  ) : (
                    <StatusIcon />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  id="document-upload"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading || mode !== "audio"}
                />
              </div>
            </div>
          </div>

          <div
            className={cn(
              "absolute inset-0 w-40 h-32 md:w-52 md:h-52 rounded-full m-auto",
              "bg-linear-to-r from-red-500/0 via-red-600/20 to-red-700/0",
              "blur-xl transition-opacity duration-300",
              isActive ? "opacity-100" : "opacity-0"
            )}
          />
        </div>

        <div className="flex items-center justify-center w-full max-w-md px-4">
          {(isListening || isProcessing) && transcript ? (
            <div className="text-center px-4 py-2 rounded-lg bg-muted/50 border border-border w-full">
              <p className="text-sm text-foreground italic line-clamp-2">
                "{transcript}"
              </p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-center px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 w-full">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive flex-1">
                {error.message}
              </p>
              {error.recoverable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="text-destructive hover:text-destructive shrink-0"
                >
                  Cerrar
                </Button>
              )}
            </div>
          ) : null}
        </div>

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
              <Volume2 className="w-5 h-5 animate-pulse" />
            ) : (
              <Mic
                className={cn("w-5 h-5", isListening && "animate-pulse")}
              />
            )}
            {isMobile && !isDisabled && isIdle
              ? "Mantén para hablar"
              : getButtonText()}
          </span>
        </button>

        {isSpeaking && (
          <Button
            variant="outline"
            size="sm"
            onClick={cancelSpeaking}
            className="text-muted-foreground"
          >
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
          <Button
            variant="ghost"
            size="sm"
            onClick={resetSession}
            className="text-muted-foreground gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Nueva conversación
          </Button>
        )}
        </>
        )}
      </div>

      <div
        className={cn(
          "hidden lg:block h-full border-l border-border bg-background/95 backdrop-blur-sm",
          "transition-all duration-500 ease-out overflow-hidden",
          isPanelOpen ? "w-[400px] xl:w-[450px]" : "w-0 border-l-0"
        )}
      >
        <div
          className={cn(
            "h-full w-[400px] xl:w-[450px] flex flex-col min-h-0",
            "transition-all duration-500 ease-out",
            isPanelOpen
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-8"
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-red-500" />
              <h3 className="font-semibold text-sm">Conversación</h3>
              {messages.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {messages.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                onClick={resetSession}
                title="Nueva conversación"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                onClick={() => setPanelOpen(false)}
                title="Cerrar panel"
              >
                <PanelRightClose className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {chatContent}
        </div>
      </div>

      <Drawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) {
            useDynamoStore.getState().setPanelOpen(false);
          }
        }}
      >
        <DrawerContent className="lg:hidden max-h-[75vh] flex flex-col">
          <DrawerHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-red-500" />
                <DrawerTitle className="text-sm">Conversación</DrawerTitle>
                {messages.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {messages.length}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={resetSession}
                  title="Nueva conversación"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </DrawerHeader>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{chatContent}</div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
