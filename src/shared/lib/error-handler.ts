import { toast } from 'sonner';
import { AuthError, PostgrestError } from '@supabase/supabase-js';

// Tipos de errores personalizados
export enum ErrorType {
  AUTH = 'AUTH',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
  code?: string;
}

// Mapeo de códigos de error de Supabase a mensajes amigables
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'invalid_credentials': 'Credenciales inválidas. Verifica tu email y contraseña.',
  'email_not_confirmed': 'Por favor confirma tu email antes de iniciar sesión.',
  'user_not_found': 'Usuario no encontrado.',
  'invalid_grant': 'Credenciales inválidas.',
  'weak_password': 'La contraseña es muy débil. Debe tener al menos 6 caracteres.',
  'email_exists': 'Este email ya está registrado.',
  'session_not_found': 'Sesión expirada. Por favor inicia sesión nuevamente.',
  'refresh_token_not_found': 'Sesión expirada. Por favor inicia sesión nuevamente.',
  'oauth_provider_disabled': 'El proveedor de Google no está habilitado. Contacta al administrador.',
  'oauth_not_allowed': 'El login con Google no está permitido.',
  'request_timeout': 'La conexión con Google ha expirado. Intenta nuevamente.',
};

const DATABASE_ERROR_MESSAGES: Record<string, string> = {
  '23505': 'Este registro ya existe.',
  '23503': 'No se puede eliminar este registro porque está siendo usado.',
  '23502': 'Faltan campos requeridos.',
  '42501': 'No tienes permisos para realizar esta acción.',
  'PGRST116': 'No se encontró el registro.',
};

/**
 * Procesa errores de Supabase Auth
 */
function handleAuthError(error: AuthError): AppError {
  const message = AUTH_ERROR_MESSAGES[error.message] || 
                  AUTH_ERROR_MESSAGES[error.code || ''] ||
                  error.message ||
                  'Error de autenticación';

  return {
    type: ErrorType.AUTH,
    message,
    originalError: error,
    code: error.code,
  };
}

/**
 * Procesa errores de Supabase Database (Postgrest)
 */
function handleDatabaseError(error: PostgrestError): AppError {
  const message = DATABASE_ERROR_MESSAGES[error.code] ||
                  error.message ||
                  'Error en la base de datos';

  return {
    type: ErrorType.DATABASE,
    message,
    originalError: error,
    code: error.code,
  };
}

/**
 * Procesa errores de red
 */
function handleNetworkError(error: Error): AppError {
  return {
    type: ErrorType.NETWORK,
    message: 'Error de conexión. Verifica tu conexión a internet.',
    originalError: error,
  };
}

/**
 * Handler principal de errores de Supabase
 */
export function handleSupabaseError(error: unknown, showToast = true): AppError {
  let appError: AppError;

  // Detectar tipo de error
  if (error && typeof error === 'object') {
    if ('__isAuthError' in error || (error as Record<string, unknown>).status === 400) {
      appError = handleAuthError(error as AuthError);
    } else if ('code' in error && 'message' in error && 'details' in error) {
      appError = handleDatabaseError(error as PostgrestError);
    } else if (error instanceof Error && error.message.includes('fetch')) {
      appError = handleNetworkError(error);
    } else if (error instanceof Error) {
      appError = {
        type: ErrorType.UNKNOWN,
        message: error.message || 'Ha ocurrido un error inesperado',
        originalError: error,
      };
    } else {
      appError = {
        type: ErrorType.UNKNOWN,
        message: 'Ha ocurrido un error inesperado',
        originalError: error,
      };
    }
  } else {
    appError = {
      type: ErrorType.UNKNOWN,
      message: 'Ha ocurrido un error inesperado',
      originalError: error,
    };
  }

  // Mostrar toast si está habilitado
  if (showToast) {
    toast.error(appError.message);
  }

  // Log para debugging
  console.error('[Error Handler]', {
    type: appError.type,
    message: appError.message,
    code: appError.code,
    originalError: appError.originalError,
  });

  return appError;
}

/**
 * Wrapper para operaciones async que maneja errores automáticamente
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  showToast = true
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    const appError = handleSupabaseError(error, showToast);
    return { data: null, error: appError };
  }
}
