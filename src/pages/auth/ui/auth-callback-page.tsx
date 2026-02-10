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

                // Obtener el código de la URL
                const params = new URLSearchParams(window.location.search)
                const code = params.get('code')
                const error_description = params.get('error_description')

                if (error_description) {
                    throw new Error(error_description)
                }

                if (!code) {
                    throw new Error('No se recibió código de autenticación')
                }

                console.log('✅ Código recibido, intercambiando por sesión...')

                // Intercambiar el código por una sesión
                const { data: { session }, error: sessionError } =
                    await supabase.auth.exchangeCodeForSession(code)

                if (sessionError) throw sessionError
                if (!session) throw new Error('No se pudo crear la sesión')

                console.log('✅ Sesión creada, verificando usuario...')

                // Obtener datos del usuario de la tabla usuarios
                const { data: usuario, error: userError } = await supabase
                    .from('usuarios')
                    .select('aprobado, activo, nombre, email, id_rol')
                    .eq('id_usuario', session.user.id)
                    .single()

                console.log('👤 Usuario encontrado:', usuario)

                if (userError) {
                    console.error('❌ Error al obtener usuario:', userError)
                    // Si el usuario no existe en la tabla, puede ser que el trigger no se ejecutó
                    // Esperar 2 segundos y reintentar
                    await new Promise(resolve => setTimeout(resolve, 2000))

                    const { data: usuario2, error: userError2 } = await supabase
                        .from('usuarios')
                        .select('aprobado, activo, nombre, email, id_rol')
                        .eq('id_usuario', session.user.id)
                        .single()

                    if (userError2) {
                        throw new Error('Error al verificar el estado del usuario. Por favor contacta al administrador.')
                    }

                    // Usar el segundo intento
                    if (!usuario2.aprobado) {
                        console.log('⏳ Usuario no aprobado, redirigiendo a pending-approval')
                        navigate('/pending-approval', { replace: true })
                        return
                    }

                    if (!usuario2.activo) {
                        await supabase.auth.signOut()
                        setError('Tu cuenta ha sido desactivada. Contacta al administrador.')
                        return
                    }

                    console.log('✅ Usuario aprobado, redirigiendo a dashboard')
                    navigate('/', { replace: true })
                    return
                }

                // Validar si está aprobado
                if (!usuario.aprobado) {
                    console.log('⏳ Usuario no aprobado, redirigiendo a pending-approval')
                    navigate('/pending-approval', { replace: true })
                    return
                }

                // Validar si está activo
                if (!usuario.activo) {
                    console.log('❌ Usuario inactivo')
                    await supabase.auth.signOut()
                    setError('Tu cuenta ha sido desactivada. Contacta al administrador.')
                    return
                }

                // Todo OK, redirigir al dashboard
                console.log('✅ Usuario aprobado y activo, redirigiendo a dashboard')
                navigate('/', { replace: true })

            } catch (err: any) {
                console.error('❌ Error en callback:', err)
                setError(err.message || 'Error al procesar la autenticación')

                // Esperar 3 segundos y redirigir al login
                setTimeout(() => {
                    navigate('/login', { replace: true })
                }, 3000)
            }
        }

        handleCallback()
    }, [navigate])

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 text-red-500">
                            <svg
                                className="h-12 w-12"
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
                        <h2 className="mt-4 text-xl font-bold text-gray-900">
                            Error de Autenticación
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">{error}</p>
                        <p className="mt-4 text-xs text-gray-500">
                            Redirigiendo al login...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-blue-500 animate-spin">
                        <svg
                            className="h-12 w-12"
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
                    <h2 className="mt-4 text-xl font-bold text-gray-900">
                        Procesando autenticación...
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Por favor espera un momento
                    </p>
                </div>
            </div>
        </div>
    )
}