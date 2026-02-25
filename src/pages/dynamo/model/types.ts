/**
 * Tipos para el agente de voz Dynamo
 */

// Petición a la Edge Function
export interface VoiceAgentRequest {
  pregunta: string;
  session_id: string | null;
}

// Error en la respuesta del agente
export interface VoiceAgentError {
  nodo: string;
  mensaje: string;
  recuperable: boolean;
}

// Respuesta de la Edge Function
export interface VoiceAgentResponse {
  respuesta: string;
  session_id: string;
  intenciones_detectadas: string[];
  errores: VoiceAgentError[] | null;
}

// Estados del agente de voz
export type VoiceAgentStatus =
  | "idle"           // Listo para escuchar
  | "listening"      // Escuchando al usuario
  | "processing"     // Procesando con el backend
  | "speaking"       // Reproduciendo respuesta
  | "error";         // Error

// Errores específicos del agente de voz
export type VoiceAgentErrorType =
  | "microphone_not_available"
  | "speech_not_supported"
  | "no_speech_detected"
  | "api_error"
  | "network_error"
  | "unknown_error";

// Estructura del error del hook
export interface VoiceAgentHookError {
  type: VoiceAgentErrorType;
  message: string;
  recoverable: boolean;
}

// Retorno del hook useVoiceAgent
export interface UseVoiceAgentReturn {
  // Estados
  status: VoiceAgentStatus;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isIdle: boolean;

  // Datos
  transcript: string | null;
  lastResponse: string | null;
  error: VoiceAgentHookError | null;

  // Compatibilidad del navegador
  isSupported: boolean;

  // Acciones
  startListening: () => void;
  stopListening: () => void;
  cancelSpeaking: () => void;
  clearError: () => void;
  resetSession: () => void;
  processText: (text: string) => Promise<void>;
}

// Tipos para Web Speech API (extender window)
export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}
