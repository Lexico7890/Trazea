// src/pages/auth/ui/AuthCallback.tsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/shared/api/supabase'

export function AuthCallback() {
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const handleCallback = async () => {
            try {
                console.log('🔄 Iniciando proceso de callback...')
                console.log('📍 URL completa:', window.location.href)
                console.log('📍 Search:', window.location.search)
                console.log('📍 Hash:', window.location.hash)

                // 1. Intentar obtener parámetros del query string
                let params = new URLSearchParams(window.location.search)
                let code = params.get('code')
                let error_code = params.get('error_code')
                let error_description = params.get('error_description')

                // 2. Si no hay en query string, intentar en el hash
                if (!code && window.location.hash) {
                    console.log('🔍 No hay code en query, buscando en hash...')
                    // Remover el # inicial
                    const hashParams = new URLSearchParams(window.location.hash.substring(1))
                    code = hashParams.get('code')
                    error_code = hashParams.get('error_code')
                    error_description = hashParams.get('error_description')

                    // También puede venir access_token directamente (flow implícito)
                    const access_token = hashParams.get('access_token')
                    const refresh_token = hashParams.get('refresh_token')

                    if (access_token) {
                        console.log('✅ Encontrado access_token en hash (flow implícito)')

                        // Establecer la sesión directamente con los tokens
                        const { data, error: sessionError } = await supabase.auth.setSession({
                            access_token,
                            refresh_token: refresh_token || ''
                        })

                        if (sessionError) {
                            throw new Error(`Error al establecer sesión: ${sessionError.message}`)
                        }

                        if (!data.session) {
                            throw new Error('No se pudo crear la sesión')
                        }

                        console.log('✅ Sesión establecida exitosamente')

                        // Continuar con la verificación del usuario
                        await verifyAndRedirect(data.session.user.id)
                        return
                    }
                }

                console.log('📊 Parámetros encontrados:', { code, error_code, error_description })

                // 3. Verificar errores de OAuth
                if (error_code || error_description) {
                    console.error('❌ Error de OAuth:', { error_code, error_description })
                    throw new Error(error_description || 'Error en la autenticación con Google')
                }

                // 4. Verificar que llegó el código
                if (!code) {
                    console.error('❌ No se encontró código ni access_token')
                    throw new Error('No se recibió el código de autenticación. Por favor intenta nuevamente.')
                }

                console.log('✅ Código recibido:', code.substring(0, 10) + '...')

                // 5. Intercambiar código por sesión
                const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

                if (sessionError) {
                    console.error('❌ Error al intercambiar código:', sessionError)
                    throw new Error(`Error al crear la sesión: ${sessionError.message}`)
                }

                if (!sessionData.session) {
                    throw new Error('No se pudo crear la sesión')
                }

                console.log('✅ Sesión creada exitosamente para:', sessionData.session.user.email)

                // Continuar con la verificación del usuario
                await verifyAndRedirect(sessionData.session.user.id)

            } catch (err: any) {
                console.error('❌ Error en callback:', err)
                setError(err.message || 'Error desconocido al procesar la autenticación')
            }
        }

        // Función auxiliar para verificar usuario y redirigir
        const verifyAndRedirect = async (userId: string) => {
            try {
                // Esperar a que el trigger cree el usuario
                console.log('⏳ Esperando creación del usuario en la base de datos...')
                await new Promise(resolve => setTimeout(resolve, 2000))

                // Verificar estado del usuario
                const { data: usuario, error: userError } = await supabase
                    .from('usuarios')
                    .select('id_usuario, nombre, email, aprobado, activo')
                    .eq('id_usuario', userId)
                    .maybeSingle()

                console.log('📊 Usuario en BD:', usuario)

                // Si no existe, reintentar
                if (userError || !usuario) {
                    console.log('⏳ Usuario no encontrado, reintentando...')
                    await new Promise(resolve => setTimeout(resolve, 2000))

                    const { data: usuario2, error: userError2 } = await supabase
                        .from('usuarios')
                        .select('id_usuario, nombre, email, aprobado, activo')
                        .eq('id_usuario', userId)
                        .maybeSingle()

                    if (userError2 || !usuario2) {
                        console.error('❌ Usuario no encontrado después de reintentos')
                        await supabase.auth.signOut()
                        throw new Error('Tu usuario no pudo ser configurado. Contacta al administrador.')
                    }

                    // Usar segundo intento
                    if (!usuario2.aprobado) {
                        console.log('⏳ Usuario no aprobado')
                        navigate('/pending-approval', { replace: true })
                        return
                    }

                    if (!usuario2.activo) {
                        await supabase.auth.signOut()
                        throw new Error('Tu cuenta ha sido desactivada.')
                    }

                    console.log('✅ Usuario aprobado y activo')
                    navigate('/', { replace: true })
                    return
                }

                // Verificar aprobación
                if (!usuario.aprobado) {
                    console.log('⏳ Usuario no aprobado')
                    navigate('/pending-approval', { replace: true })
                    return
                }

                // Verificar si está activo
                if (!usuario.activo) {
                    console.log('❌ Usuario inactivo')
                    await supabase.auth.signOut()
                    throw new Error('Tu cuenta ha sido desactivada.')
                }

                // Todo correcto
                console.log('✅ Autenticación exitosa')
                navigate('/', { replace: true })
            } catch (err: any) {
                console.error('❌ Error en verificación:', err)
                throw err
            }
        }

        handleCallback()
    }, [navigate])

    const handleBackToLogin = async () => {
        try {
            await supabase.auth.signOut()
            //localStorage.removeItem('sb-xeypfdmbpkzkkfmthqwb-auth-token')
            navigate('/login', { replace: true })
        } catch (error) {
            console.error('Error al limpiar sesión:', error)
            //localStorage.clear()
            window.location.href = '/login'
        }
    }

    // Pantalla de error
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                            <svg
                                className="h-6 w-6 text-red-600 dark:text-red-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>

                        <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                            Error de Autenticación
                        </h2>

                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {error}
                        </p>

                        <button
                            onClick={handleBackToLogin}
                            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                            Volver al Login
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Pantalla de carga
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
            <div className="max-w-md w-full p-8 bg-white dark:bg-gray-500/10 dark:border dark:border-gray-800 rounded-lg shadow">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-blue-500">
                        <svg
                            className="h-12 w-12 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                    </div>

                    <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                        Procesando autenticación...
                    </h2>

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        Por favor espera un momento
                    </p>
                </div>
            </div>
        </div>
    )
}