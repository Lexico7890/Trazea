import { useRef, useState } from "react";
import { Mic, MicOff, Volume2, Loader2, Upload } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/shared/api/supabase";
import { useDynamoStore } from "../model/useDynamoStore";

const EDGE_FUNCTION_URL =
  "https://xeypfdmbpkzkkfmthqwb.supabase.co/functions/v1/agent-voice";

interface AudioInputProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  transcript: string;
  error: { message: string; recoverable?: boolean } | null;
  onClearError: () => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  canUpload?: boolean;
}

export function AudioInput({
  isListening,
  isProcessing,
  isSpeaking,
  isSupported,
  transcript,
  error,
  onClearError,
  canUpload = true,
}: AudioInputProps) {
  const isActive = isListening || isProcessing || isSpeaking;
  const [isMicHovered, setIsMicHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          isListening && "animate-pulse",
        )}
      />
    );
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      toast.error("Solo puedes subir un documento a la vez");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const file = files[0];

    // Validar que sea PDF
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Solo se aceptan archivos PDF");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No hay sesión de usuario activa");
      }

      const formData = new FormData();
      formData.append("file", file); // ← era "document"
      formData.append("nombre", file.name.replace(".pdf", "")); // ← nuevo campo requerido
      formData.append("tipo", "otro"); // ← nuevo campo requerido
      formData.append("descripcion", `Subido por usuario desde chat`);

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          // NO agregar Content-Type aquí
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error del servidor: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();

      useDynamoStore.getState().addMessage({
        role: "user",
        content: `Documento cargado: ${file.name}`,
      });

      useDynamoStore.getState().addMessage({
        role: "assistant",
        content:
          data.mensaje ||
          "Documento procesado correctamente. Ya puedes hacer preguntas sobre él.",
      });

      toast.success("Documento procesado correctamente");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      toast.error(`Error al procesar documento: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
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
            !isSupported && "opacity-50",
          )}
        >
          <div
            className={cn(
              "w-full h-full rounded-full flex items-center justify-center",
              "bg-background transition-all duration-300",
              isActive &&
                "bg-linear-to-br from-red-900/50 via-red-800/50 to-red-900-50",
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
                  isListening && "scale-90",
                )}
                onMouseEnter={() => setIsMicHovered(true)}
                onMouseLeave={() => setIsMicHovered(false)}
              >
                {isMicHovered && canUpload ? (
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
              {canUpload && (
                <input
                  ref={fileInputRef}
                  id="document-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              )}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "absolute inset-0 w-40 h-32 md:w-52 md:h-52 rounded-full m-auto",
            "bg-linear-to-r from-red-500/0 via-red-600/20 to-red-700/0",
            "blur-xl transition-opacity duration-300",
            isActive ? "opacity-100" : "opacity-0",
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
            <p className="text-sm text-destructive flex-1">{error.message}</p>
            {error.recoverable && (
              <button
                onClick={onClearError}
                className="text-destructive hover:text-destructive shrink-0 text-sm"
              >
                Cerrar
              </button>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
