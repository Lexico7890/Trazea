import { useState } from "react";
import { Mic } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";

export function DynamoPage() {
  const [isPressed, setIsPressed] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handlePressStart = () => {
    setIsPressed(true);
    setIsListening(true);
    // TODO: Implementar lógica de captura de audio
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    setIsListening(false);
    // TODO: Implementar lógica de envío de audio
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-12 p-4">
      {/* Título */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
            Dynamo
          </h1>
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            Beta
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          Mantén presionado el botón para hablar
        </p>
      </div>

      {/* Círculo estilo Sesame */}
      <div className="relative flex items-center justify-center">
        {/* Ondas de animación cuando está escuchando */}
        {isListening && (
          <>
            <div className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-r from-red-500/20 via-red-600/20 to-red-700/20 animate-ping" />
            <div className="absolute w-44 h-44 md:w-56 md:h-56 rounded-full bg-gradient-to-r from-red-500/30 via-red-600/30 to-red-700/30 animate-pulse" />
          </>
        )}

        {/* Círculo exterior con gradiente rotativo */}
        <div
          className={cn(
            "relative w-40 h-40 md:w-52 md:h-52 rounded-full p-1",
            "bg-gradient-to-r from-red-500 via-red-600 to-red-700",
            isListening && "animate-spin-slow"
          )}
        >
          {/* Círculo interior */}
          <div
            className={cn(
              "w-full h-full rounded-full flex items-center justify-center",
              "bg-background transition-all duration-300",
              isPressed && "bg-gradient-to-br from-red-900/50 via-red-800/50 to-red-900/50"
            )}
          >
            {/* Ondas internas cuando está activo */}
            <div className="relative flex items-center justify-center">
              {isListening && (
                <div className="absolute w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-red-500/40 via-red-600/40 to-red-700/40 animate-pulse" />
              )}

              {/* Icono central */}
              <div
                className={cn(
                  "relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br from-red-500 via-red-600 to-red-700",
                  "shadow-lg shadow-red-500/25",
                  "transition-transform duration-200",
                  isPressed && "scale-90"
                )}
              >
                <Mic
                  className={cn(
                    "w-8 h-8 md:w-10 md:h-10 text-white transition-all duration-200",
                    isListening && "animate-pulse"
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Efecto de resplandor */}
        <div
          className={cn(
            "absolute inset-0 w-40 h-40 md:w-52 md:h-52 rounded-full",
            "bg-gradient-to-r from-red-500/0 via-red-600/20 to-red-700/0",
            "blur-xl transition-opacity duration-300",
            isListening ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      {/* Botón de push-to-talk */}
      <button
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        className={cn(
          "relative px-8 py-4 rounded-full font-semibold text-white",
          "bg-gradient-to-r from-red-500 via-red-600 to-red-700",
          "shadow-lg shadow-red-500/25",
          "transition-all duration-200 ease-out",
          "select-none touch-none",
          "hover:shadow-xl hover:shadow-red-500/30",
          "active:scale-95",
          isPressed && "scale-95 shadow-inner"
        )}
      >
        <span className="flex items-center gap-2">
          <Mic className={cn("w-5 h-5", isPressed && "animate-pulse")} />
          {isPressed ? "Escuchando..." : "Mantén presionado para hablar"}
        </span>
      </button>

      {/* Indicador de estado */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div
          className={cn(
            "w-2 h-2 rounded-full transition-colors duration-300",
            isListening
              ? "bg-red-500 animate-pulse"
              : "bg-muted-foreground/50"
          )}
        />
        <span>{isListening ? "Grabando audio..." : "Listo para escuchar"}</span>
      </div>
    </div>
  );
}
