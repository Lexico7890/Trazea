import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer";
import { useIsMobile } from "@/shared/lib/use-mobile";
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
import { useDynamoStore } from "../model/useDynamoStore";
import { ChatMessages } from "./ChatMessages";

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

  const isDisabled = isProcessing || isSpeaking || !isSupported;
  const isActive = isListening || isProcessing || isSpeaking;

  // Auto-abrir panel en desktop cuando llega el primer mensaje
  useEffect(() => {
    if (!isMobile && messages.length > 0 && !isPanelOpen) {
      setPanelOpen(true);
    }
    // Solo en el primer mensaje, no re-abrir si el usuario lo cerró
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length > 0]);

  // Auto-abrir panel en desktop cuando llega el primer mensaje
  useEffect(() => {
    if (!isMobile && messages.length > 0 && !isPanelOpen) {
      setPanelOpen(true);
    }
    // Solo en el primer mensaje, no re-abrir si el usuario lo cerró
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length > 0]);

  // Texto del botón según estado
  const getButtonText = () => {
    if (!isSupported) return "Navegador no compatible";
    if (isListening) return "Escuchando...";
    if (isProcessing) return "Procesando...";
    if (isSpeaking) return "Reproduciendo...";
    return "Presiona para hablar";
  };

  // Texto del indicador de estado
  const getStatusText = () => {
    if (!isSupported) return "Tu navegador no soporta las APIs de voz";
    if (error) return error.message;
    if (isListening) return transcript || "Escuchando tu voz...";
    if (isProcessing) return "Procesando tu consulta...";
    if (isSpeaking) return "Reproduciendo respuesta...";
    return "Listo para escuchar";
  };

  // Icono según estado
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

  // Handler para seleccionar opción
  const handleSelectOption = async (
    messageId: string,
    optionId: string,
    optionLabel: string
  ) => {
    updateMessageSelection(messageId, optionId);
    await processText(optionLabel);
  };

  // Handler para abrir chat
  const handleChatToggle = () => {
    if (isMobile) {
      setIsDrawerOpen(true);
    } else {
      togglePanel();
    }
  };

  // Contenido del chat compartido entre desktop y mobile
  const chatContent = (
    <ChatMessages
      messages={messages}
      onSelectOption={handleSelectOption}
      isProcessing={isProcessing}
    />
  );

  // Handler para seleccionar opción
  const handleSelectOption = async (
    messageId: string,
    optionId: string,
    optionLabel: string
  ) => {
    updateMessageSelection(messageId, optionId);
    await processText(optionLabel);
  };

  // Handler para abrir chat
  const handleChatToggle = () => {
    if (isMobile) {
      setIsDrawerOpen(true);
    } else {
      togglePanel();
    }
  };

  // Contenido del chat compartido entre desktop y mobile
  const chatContent = (
    <ChatMessages
      messages={messages}
      onSelectOption={handleSelectOption}
      isProcessing={isProcessing}
    />
  );

  return (
    <div className="flex h-[calc(100dvh-6rem)] overflow-hidden">
      {/* ===== Sección del agente de voz (lado izquierdo / principal) ===== */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 relative min-w-0">
        {/* Botón para abrir/cerrar chat */}
        {messages.length > 0 && (
          <button
            onClick={handleChatToggle}
            className={cn(
              "absolute top-4 right-4 z-10",
              "flex items-center gap-2 px-3 py-2 rounded-full",
              "bg-muted/80 backdrop-blur-sm border border-border",
              "text-sm text-muted-foreground",
              "hover:bg-muted hover:text-foreground",
              "transition-all duration-200",
              // En desktop, ocultar cuando el panel está abierto
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

        {/* Título */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
              Dynamo
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
              ? "Presiona el botón para hablar o escribe tu consulta"
              : "Usa Chrome, Edge o Safari para usar esta función"}
          </p>
        </div>
    <div className="flex h-[calc(100dvh-6rem)] overflow-hidden">
      {/* ===== Sección del agente de voz (lado izquierdo / principal) ===== */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 relative min-w-0">
        {/* Botón para abrir/cerrar chat */}
        {messages.length > 0 && (
          <button
            onClick={handleChatToggle}
            className={cn(
              "absolute top-4 right-4 z-10",
              "flex items-center gap-2 px-3 py-2 rounded-full",
              "bg-muted/80 backdrop-blur-sm border border-border",
              "text-sm text-muted-foreground",
              "hover:bg-muted hover:text-foreground",
              "transition-all duration-200",
              // En desktop, ocultar cuando el panel está abierto
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

        {/* Título */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
              Dynamo
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
              ? "Presiona el botón para hablar o escribe tu consulta"
              : "Usa Chrome, Edge o Safari para usar esta función"}
          </p>
        </div>

        {/* Contenedor del círculo con altura fija para evitar saltos */}
        <div className="relative flex items-center justify-center h-56 md:h-64">
          {/* Ondas de animación cuando está activo */}
          {isActive && (
            <>
              <div className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full bg-linear-to-r from-red-500/20 via-red-600/20 to-red-700/20 animate-ping" />
              <div className="absolute w-44 h-44 md:w-56 md:h-56 rounded-full bg-linear-to-r from-red-500/30 via-red-600/30 to-red-700/30 animate-pulse" />
            </>
          )}
        {/* Contenedor del círculo con altura fija para evitar saltos */}
        <div className="relative flex items-center justify-center h-56 md:h-64">
          {/* Ondas de animación cuando está activo */}
          {isActive && (
            <>
              <div className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full bg-linear-to-r from-red-500/20 via-red-600/20 to-red-700/20 animate-ping" />
              <div className="absolute w-44 h-44 md:w-56 md:h-56 rounded-full bg-linear-to-r from-red-500/30 via-red-600/30 to-red-700/30 animate-pulse" />
            </>
          )}

          {/* Círculo exterior con gradiente rotativo */}
          <div
            className={cn(
              "relative w-40 h-40 md:w-52 md:h-52 rounded-full p-1",
              "bg-linear-to-r from-red-500 via-red-600 to-red-700",
              isActive && "animate-spin-slow",
              !isSupported && "opacity-50"
            )}
          >
            {/* Círculo interior */}
            <div
              className={cn(
                "w-full h-full rounded-full flex items-center justify-center",
                "bg-background transition-all duration-300",
                isActive &&
                  "bg-linear-to-br from-red-900/50 via-red-800/50 to-red-900/50"
              )}
            >
              {/* Ondas internas cuando está activo */}
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <div className="absolute w-20 h-20 md:w-24 md:h-24 rounded-full bg-linear-to-r from-red-500/40 via-red-600/40 to-red-700/40 animate-pulse" />
                )}
          {/* Círculo exterior con gradiente rotativo */}
          <div
            className={cn(
              "relative w-40 h-40 md:w-52 md:h-52 rounded-full p-1",
              "bg-linear-to-r from-red-500 via-red-600 to-red-700",
              isActive && "animate-spin-slow",
              !isSupported && "opacity-50"
            )}
          >
            {/* Círculo interior */}
            <div
              className={cn(
                "w-full h-full rounded-full flex items-center justify-center",
                "bg-background transition-all duration-300",
                isActive &&
                  "bg-linear-to-br from-red-900/50 via-red-800/50 to-red-900/50"
              )}
            >
              {/* Ondas internas cuando está activo */}
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <div className="absolute w-20 h-20 md:w-24 md:h-24 rounded-full bg-linear-to-r from-red-500/40 via-red-600/40 to-red-700/40 animate-pulse" />
                )}

                {/* Icono central */}
                <div
                  className={cn(
                    "relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center",
                    "bg-linear-to-br from-red-500 via-red-600 to-red-700",
                    "shadow-lg shadow-red-500/25",
                    "transition-transform duration-200",
                    isListening && "scale-90"
                  )}
                >
                  <StatusIcon />
                </div>
              </div>
            </div>
          </div>
                {/* Icono central */}
                <div
                  className={cn(
                    "relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center",
                    "bg-linear-to-br from-red-500 via-red-600 to-red-700",
                    "shadow-lg shadow-red-500/25",
                    "transition-transform duration-200",
                    isListening && "scale-90"
                  )}
                >
                  <StatusIcon />
                </div>
              </div>
            </div>
          </div>

          {/* Efecto de resplandor */}
          <div
            className={cn(
              "absolute inset-0 w-40 h-32 md:w-52 md:h-52 rounded-full m-auto",
              "bg-linear-to-r from-red-500/0 via-red-600/20 to-red-700/0",
              "blur-xl transition-opacity duration-300",
              isActive ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
          {/* Efecto de resplandor */}
          <div
            className={cn(
              "absolute inset-0 w-40 h-32 md:w-52 md:h-52 rounded-full m-auto",
              "bg-linear-to-r from-red-500/0 via-red-600/20 to-red-700/0",
              "blur-xl transition-opacity duration-300",
              isActive ? "opacity-100" : "opacity-0"
            )}
          />
        </div>

        {/* Contenedor de mensajes con altura fija para evitar que el botón se mueva */}
        <div className="flex items-center justify-center w-full max-w-md px-4">
          {/* Transcript en tiempo real */}
          {(isListening || isProcessing) && transcript ? (
            <div className="text-center px-4 py-2 rounded-lg bg-muted/50 border border-border w-full">
              <p className="text-sm text-foreground italic line-clamp-2">
                "{transcript}"
              </p>
            </div>
          ) : /* Error */ error ? (
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
        {/* Contenedor de mensajes con altura fija para evitar que el botón se mueva */}
        <div className="flex items-center justify-center w-full max-w-md px-4">
          {/* Transcript en tiempo real */}
          {(isListening || isProcessing) && transcript ? (
            <div className="text-center px-4 py-2 rounded-lg bg-muted/50 border border-border w-full">
              <p className="text-sm text-foreground italic line-clamp-2">
                "{transcript}"
              </p>
            </div>
          ) : /* Error */ error ? (
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

        {/* Botón de push-to-talk */}
        <button
          onClick={() => {
            if (isListening) {
              stopListening();
            } else if (!isProcessing && !isSpeaking) {
              startListening();
            }
          }}
          disabled={isProcessing || isSpeaking || !isSupported}
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
            {getButtonText()}
          </span>
        </button>

        {/* Botón para cancelar reproducción */}
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
        {/* Botón para cancelar reproducción */}
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

        {/* Indicador de estado */}
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
        {/* Indicador de estado */}
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

        {/* Botón para resetear sesión */}
        {(lastResponse || error) && isIdle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetSession}
            className="text-muted-foreground gap-2"
            className="text-muted-foreground gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Nueva conversación
          </Button>
        )}
      </div>

      {/* ===== Panel lateral de chat (Desktop lg+) ===== */}
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
          {/* Header del panel */}
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

          {/* Mensajes */}
          {chatContent}
        </div>
      </div>

      {/* ===== Drawer de chat (Mobile) ===== */}
      <Drawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) {
            // Marcar como leído al cerrar
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
          <div className="flex-1 overflow-hidden min-h-0">{chatContent}</div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
