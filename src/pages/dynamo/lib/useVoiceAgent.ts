import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/shared/api/supabase";
import type {
  VoiceAgentStatus,
  VoiceAgentResponse,
  VoiceAgentHookError,
  UseVoiceAgentReturn,
  VoiceAgentErrorType,
} from "../model/types";

// Tipos para Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onnomatch: (() => void) | null;
  onaudiostart: (() => void) | null;
  onaudioend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// URL de la Edge Function
const EDGE_FUNCTION_URL =
  "https://xeypfdmbpkzkkfmthqwb.supabase.co/functions/v1/agent-voice";

// Configuración de ElevenLabs (Vite usa import.meta.env)
const ELEVENLABS_API_KEY = import.meta.env?.VITE_PUBLIC_ELEVENLABS_API_KEY ?? "";
const ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Voz femenina española - "Bella"

// Debug logging
const DEBUG = true;
const log = (...args: unknown[]) => {
  if (DEBUG) {
    console.log("[VoiceAgent]", ...args);
  }
};

// Helper para crear errores
function createError(
  type: VoiceAgentErrorType,
  message: string,
  recoverable = true
): VoiceAgentHookError {
  return { type, message, recoverable };
}

// Verificar soporte del navegador
function checkBrowserSupport(): boolean {
  const hasSpeechRecognition =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const hasSpeechSynthesis =
    typeof window !== "undefined" && "speechSynthesis" in window;

  log("Browser support check:", {
    hasSpeechRecognition,
    hasSpeechSynthesis,
    userAgent: navigator.userAgent,
  });

  return hasSpeechRecognition && hasSpeechSynthesis;
}

// Obtener la clase SpeechRecognition
function getSpeechRecognition(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function useVoiceAgent(): UseVoiceAgentReturn {
  // Estados
  const [status, setStatus] = useState<VoiceAgentStatus>("idle");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [error, setError] = useState<VoiceAgentHookError | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  // Referencias
  const sessionIdRef = useRef<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isUnmountedRef = useRef(false);
  const isListeningRef = useRef(false);
  const hasReceivedResultRef = useRef(false);
  const currentTranscriptRef = useRef<string>(""); // Guardar transcript actual para usar en stop
  const hasProcessedTranscriptRef = useRef(false); // Evitar doble procesamiento entre onend y safety timeout

  // Estados derivados
  const isListening = status === "listening";
  const isProcessing = status === "processing";
  const isSpeaking = status === "speaking";
  const isIdle = status === "idle";

  // Verificar soporte al montar
  useEffect(() => {
    log("Component mounted, checking browser support...");
    isUnmountedRef.current = false;
    const supported = checkBrowserSupport();
    setIsSupported(supported);

    if (!supported) {
      log("Browser not supported!");
      setError(
        createError(
          "speech_not_supported",
          "Tu navegador no soporta las APIs de voz. Prueba con Chrome, Edge o Safari.",
          false
        )
      );
    }

    return () => {
      log("Component unmounting, cleaning up...");
      isUnmountedRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Llamar a la Edge Function
  const callEdgeFunction = useCallback(
    async (pregunta: string): Promise<VoiceAgentResponse> => {
      log("Calling Edge Function with:", { pregunta, sessionId: sessionIdRef.current });

      // Obtener el token del usuario
      const {
        data: { session },
      } = await supabase.auth.getSession();

      log("Supabase session:", session ? "exists" : "null");

      if (!session?.access_token) {
        throw new Error("No hay sesión de usuario activa");
      }

      log("Making fetch request to:", EDGE_FUNCTION_URL);

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pregunta,
          session_id: sessionIdRef.current,
        }),
      });

      log("Fetch response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        log("Fetch error:", errorText);
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }

      const data: VoiceAgentResponse = await response.json();
      log("Edge Function response:", data);

      // Guardar session_id para la siguiente petición
      if (data.session_id) {
        sessionIdRef.current = data.session_id;
      }

      return data;
    },
    []
  );

  // Función auxiliar para Web Speech API (fallback)
  const speakWithWebSpeech = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      log("Using Web Speech API as fallback");

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(
        (voice) =>
          voice.lang.startsWith("es") &&
          (voice.name.includes("Google") || voice.name.includes("Microsoft"))
      );

      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      synthUtteranceRef.current = utterance;

      utterance.onstart = () => {
        log("Web Speech API: Speech started");
      };

      utterance.onend = () => {
        log("Web Speech API: Speech ended");
        if (!isUnmountedRef.current) {
          setStatus("idle");
        }
        resolve();
      };

      utterance.onerror = (event) => {
        log("Web Speech API: Speech error", event);
        reject(new Error("Error al reproducir la respuesta"));
      };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // Text-to-Speech con ElevenLabs
  const speakResponse = useCallback(async (text: string): Promise<void> => {
    log("Speaking response:", text.substring(0, 50) + "...");

    if (isUnmountedRef.current) {
      log("Component unmounted, skipping speech");
      return;
    }

    // Cancelar cualquier síntesis anterior
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Intentar usar ElevenLabs si hay API key
    if (ELEVENLABS_API_KEY) {
      try {
        log("Using ElevenLabs TTS");
        
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
          {
            method: "POST",
            headers: {
              Accept: "audio/mpeg",
              "Content-Type": "application/json",
              "xi-api-key": ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
              text: text,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.0,
                use_speaker_boost: true,
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Error al generar audio de ElevenLabs");
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        return new Promise((resolve, reject) => {
          audio.onended = () => {
            log("ElevenLabs speech ended");
            if (!isUnmountedRef.current) {
              setStatus("idle");
            }
            URL.revokeObjectURL(audioUrl);
            resolve();
          };

          audio.onerror = () => {
            log("ElevenLabs audio error, falling back to Web Speech API");
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
            // Fallback a Web Speech API
            speakWithWebSpeech(text).then(resolve).catch(reject);
          };

          audio.onplay = () => {
            log("ElevenLabs audio started playing");
          };

          audio.play().catch((err) => {
            log("ElevenLabs play error:", err);
            reject(err);
          });
        });
      } catch (err) {
        log("ElevenLabs error:", err);
        log("Falling back to Web Speech API");
      }
    }

    // Fallback a Web Speech API
    return speakWithWebSpeech(text);
  }, [speakWithWebSpeech]);

  // Procesar el transcript
  const processTranscript = useCallback(
    async (text: string) => {
      log("Processing transcript:", text);

      if (isUnmountedRef.current || !text.trim()) {
        log("Skipping processing - unmounted or empty text");
        setStatus("idle");
        if (!text.trim()) {
          setError(
            createError(
              "no_speech_detected",
              "No te escuché, intenta de nuevo",
              true
            )
          );
        }
        return;
      }

      try {
        setStatus("processing");
        setTranscript(text);
        setError(null);

        // Llamar a la Edge Function
        const response = await callEdgeFunction(text);

        if (isUnmountedRef.current) {
          log("Component unmounted during processing");
          return;
        }

        // Guardar la respuesta
        setLastResponse(response.respuesta);

        // Mostrar errores del backend si los hay (pero continuar)
        if (response.errores && response.errores.length > 0) {
          console.warn("Errores del agente:", response.errores);
        }

        // Reproducir la respuesta
        setStatus("speaking");
        await speakResponse(response.respuesta);
      } catch (err) {
        if (isUnmountedRef.current) return;

        log("Error processing transcript:", err);

        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";

        if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
          setError(
            createError(
              "network_error",
              "Error de conexión. Verifica tu internet.",
              true
            )
          );
        } else if (errorMessage.includes("servidor") || errorMessage.includes("500")) {
          setError(
            createError(
              "api_error",
              "Error del servidor. Intenta de nuevo.",
              true
            )
          );
        } else {
          setError(createError("api_error", errorMessage, true));
        }

        setStatus("idle");
      }
    },
    [callEdgeFunction, speakResponse]
  );

  // Iniciar reconocimiento de voz
  const startListening = useCallback(() => {
    log("startListening called", { isSupported, isListening: isListeningRef.current, status });

    if (!isSupported || isListeningRef.current || status !== "idle") {
      log("Cannot start listening - conditions not met");
      return;
    }

    setError(null);
    setTranscript(null);
    hasReceivedResultRef.current = false;
    hasProcessedTranscriptRef.current = false;
    currentTranscriptRef.current = ""; // Reset transcript ref

    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      log("SpeechRecognition class not available");
      setError(
        createError(
          "speech_not_supported",
          "Tu navegador no soporta reconocimiento de voz",
          false
        )
      );
      return;
    }

    try {
      log("Creating SpeechRecognition instance...");
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true; // Cambiado a true para mejor captura
      recognition.interimResults = true;
      recognition.lang = "es-ES";

      let finalTranscript = "";

      recognition.onaudiostart = () => {
        log("Audio capture started");
      };

      recognition.onaudioend = () => {
        log("Audio capture ended");
      };

      recognition.onstart = () => {
        log("Recognition started");
      };

      recognition.onspeechstart = () => {
        log("Speech detected");
      };

      recognition.onspeechend = () => {
        log("Speech ended");
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        log("Recognition result received:", event.results.length, "results");
        hasReceivedResultRef.current = true;
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptText = result[0].transcript;
          const confidence = result[0].confidence;

          log(`Result ${i}: "${transcriptText}" (final: ${result.isFinal}, confidence: ${confidence})`);

          if (result.isFinal) {
            finalTranscript += transcriptText;
          } else {
            interimTranscript += transcriptText;
          }
        }

        // Mostrar transcript en tiempo real
        const displayTranscript = finalTranscript || interimTranscript;
        log("Display transcript:", displayTranscript);
        setTranscript(displayTranscript);

        // Guardar en ref para usar cuando se detenga
        currentTranscriptRef.current = displayTranscript;
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        log("Recognition error:", event.error, event.message);
        isListeningRef.current = false;

        // No mostrar error si ya recibimos resultados (el error puede ser por detener)
        if (hasReceivedResultRef.current && event.error === "aborted") {
          log("Error ignored - already have results");
          return;
        }

        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setError(
            createError(
              "microphone_not_available",
              "No tienes permisos para usar el micrófono. Activa los permisos en tu navegador.",
              false
            )
          );
        } else if (event.error === "no-speech") {
          setError(
            createError(
              "no_speech_detected",
              "No te escuché, intenta de nuevo",
              true
            )
          );
        } else if (event.error === "network") {
          setError(
            createError(
              "network_error",
              "Error de red en reconocimiento de voz. Esto puede ocurrir si no hay conexión a los servidores de Google.",
              true
            )
          );
        } else if (event.error === "aborted") {
          log("Recognition aborted (this is normal when stopping)");
          // No mostrar error si fue abortado intencionalmente
        } else {
          setError(
            createError(
              "unknown_error",
              `Error de reconocimiento: ${event.error}`,
              true
            )
          );
        }

        setStatus("idle");
      };

      recognition.onnomatch = () => {
        log("No match found");
      };

      recognition.onend = () => {
        log("Recognition ended", {
          wasListening: isListeningRef.current,
          finalTranscript,
          currentTranscript: currentTranscriptRef.current,
          hasReceivedResult: hasReceivedResultRef.current,
          hasProcessedTranscript: hasProcessedTranscriptRef.current
        });

        const wasListening = isListeningRef.current;
        isListeningRef.current = false;

        if (isUnmountedRef.current) {
          log("Component unmounted, skipping onend processing");
          return;
        }

        // Evitar doble procesamiento (si el safety timeout ya proceso)
        if (hasProcessedTranscriptRef.current) {
          log("Transcript already processed, skipping onend processing");
          recognitionRef.current = null;
          return;
        }

        // Usar finalTranscript si existe, o el transcript actual del ref
        const transcriptToProcess = finalTranscript.trim() || currentTranscriptRef.current.trim();

        if (transcriptToProcess) {
          log("Processing transcript from onend:", transcriptToProcess);
          hasProcessedTranscriptRef.current = true;
          processTranscript(transcriptToProcess);
        } else if (wasListening && !hasReceivedResultRef.current) {
          // Solo mostrar error si estábamos escuchando y no recibimos ningún resultado
          log("No transcript received, showing error");
          setError(
            createError(
              "no_speech_detected",
              "No te escuché, intenta de nuevo",
              true
            )
          );
          setStatus("idle");
        } else {
          log("Recognition ended without any transcript");
          setStatus("idle");
        }

        // Limpiar la referencia del recognition
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      log("Starting recognition...");
      recognition.start();
      isListeningRef.current = true;
      setStatus("listening");
      log("Recognition should be active now");
    } catch (err) {
      log("Error starting recognition:", err);
      setError(
        createError(
          "microphone_not_available",
          "No se pudo acceder al micrófono. Verifica los permisos.",
          true
        )
      );
    }
  }, [isSupported, status, processTranscript]);

  // Detener reconocimiento de voz
  const stopListening = useCallback(() => {
    log("stopListening called", { isListening: isListeningRef.current });

    if (recognitionRef.current && isListeningRef.current) {
      log("Stopping recognition...");
      recognitionRef.current.stop();

      // Safety timeout - solo si onend nunca se dispara (2s es suficiente)
      setTimeout(() => {
        if (isListeningRef.current && !isUnmountedRef.current && !hasProcessedTranscriptRef.current) {
          log("Safety timeout triggered - onend never fired, forcing processing");
          isListeningRef.current = false;
          hasProcessedTranscriptRef.current = true;
          const pendingTranscript = currentTranscriptRef.current.trim();
          if (pendingTranscript) {
            processTranscript(pendingTranscript);
          } else {
            setStatus("idle");
          }
        }
      }, 2000);
    }
  }, [processTranscript]);

  // Cancelar síntesis de voz
  const cancelSpeaking = useCallback(() => {
    log("cancelSpeaking called");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setStatus("idle");
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    log("clearError called");
    setError(null);
  }, []);

  // Resetear sesión
  const resetSession = useCallback(() => {
    log("resetSession called");
    sessionIdRef.current = null;
    currentTranscriptRef.current = "";
    hasReceivedResultRef.current = false;
    hasProcessedTranscriptRef.current = false;
    isListeningRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setTranscript(null);
    setLastResponse(null);
    setError(null);
    setStatus("idle");
  }, []);

  // Cargar voces cuando estén disponibles
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        log("Voices loaded:", voices.length);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // Procesar texto directamente (para testing)
  const processText = useCallback(async (text: string) => {
    log("processText called with:", text, "status:", status);
    if (!text.trim() || status !== "idle") {
      log("processText skipped - empty text or not idle");
      return;
    }
    await processTranscript(text.trim());
  }, [processTranscript, status]);

  return {
    // Estados
    status,
    isListening,
    isProcessing,
    isSpeaking,
    isIdle,

    // Datos
    transcript,
    lastResponse,
    error,

    // Compatibilidad
    isSupported,

    // Acciones
    startListening,
    stopListening,
    cancelSpeaking,
    clearError,
    resetSession,
    processText,
  };
}
