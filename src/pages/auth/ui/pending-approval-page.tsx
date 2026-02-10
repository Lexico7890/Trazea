// src/pages/auth/ui/PendingApproval.tsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/shared/api/supabase'
import { useUserStore } from '@/entities/user'

export function PendingApproval() {
    const navigate = useNavigate()
    const sessionData = useUserStore((state) => state.sessionData)
    const [checking, setChecking] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Verificar estado inicial CON TIEMPO DE GRACIA
    useEffect(() => {
        // Dar tiempo para que el listener cargue los datos
        const timer = setTimeout(() => {
            setIsLoading(false)

            if (!sessionData) {
                console.log('❌ No hay sessionData después de esperar, redirigiendo a login')
                navigate('/login', { replace: true })
                return
            }

            if (sessionData.user.aprobado === true) {
                console.log('✅ Usuario ya aprobado, redirigiendo a home')
                navigate('/', { replace: true })
            }
        }, 1500) // Esperar 1.5 segundos antes de verificar

        // Si sessionData ya existe, cancelar el timer y proceder inmediatamente
        if (sessionData) {
            clearTimeout(timer)
            setIsLoading(false)

            if (sessionData.user.aprobado === true) {
                console.log('✅ Usuario ya aprobado, redirigiendo a home')
                navigate('/', { replace: true })
            }
        }

        return () => clearTimeout(timer)
    }, [sessionData, navigate])

    const checkApproval = async () => {
        if (checking) return

        setChecking(true)
        console.log('🔍 Verificando estado de aprobación...')

        try {
            const userId = sessionData?.user?.id

            if (!userId) {
                console.error('❌ No hay userId')
                navigate('/login', { replace: true })
                return
            }

            const { data, error } = await supabase
                .from('usuarios')
                .select('aprobado, activo, nombre, email')
                .eq('id_usuario', userId)
                .maybeSingle()

            if (error) {
                console.error('❌ Error al consultar:', error)
                throw error
            }

            if (!data) {
                console.error('❌ Usuario no encontrado')
                throw new Error('Usuario no encontrado en la base de datos')
            }

            console.log('📊 Estado del usuario:', data)

            if (data.aprobado === true) {
                console.log('✅ Usuario aprobado! Recargando...')
                window.location.href = '/'
            } else {
                console.log('⏳ Aún no aprobado')
                alert('Tu cuenta aún no ha sido aprobada. Por favor intenta más tarde.')
            }

        } catch (error: any) {
            console.error('❌ Error:', error)
            alert(`Error: ${error.message}`)
        } finally {
            setChecking(false)
        }
    }

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut()
            navigate('/login', { replace: true })
        } catch (error) {
            console.error('Error al cerrar sesión:', error)
            navigate('/login', { replace: true })
        }
    }

    // Mostrar loading mientras esperamos que se cargue sessionData
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando...</p>
                </div>
            </div>
        )
    }

    // Si después de esperar no hay sessionData, no mostrar nada (el useEffect ya redirigió)
    if (!sessionData) {
        return null
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900">
                        <svg
                            className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>

                    <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                        Cuenta Pendiente de Aprobación
                    </h2>

                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 space-y-3">
                        <p>
                            Hola <strong>{sessionData.user.nombre || 'Usuario'}</strong>,
                        </p>
                        <p>
                            Tu cuenta ha sido creada exitosamente, pero necesita ser aprobada
                            por un administrador antes de que puedas acceder al sistema.
                        </p>
                        <p>
                            Recibirás un correo electrónico a{' '}
                            <strong>{sessionData.user.email}</strong> cuando
                            tu cuenta sea aprobada.
                        </p>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            💡 Este proceso generalmente toma menos de 24 horas hábiles.
                        </p>
                    </div>

                    <div className="mt-6 space-y-3">
                        <button
                            onClick={checkApproval}
                            disabled={checking}
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {checking ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verificando...
                                </>
                            ) : (
                                'Verificar Estado Ahora'
                            )}
                        </button>

                        <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}