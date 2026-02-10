
import { supabase } from '@/shared/api'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function PendingApproval() {
    const navigate = useNavigate()
    const [userData, setUserData] = useState<any>(null)
    const [checking, setChecking] = useState(false)

    useEffect(() => {
        const checkApproval = async () => {
            try {
                setChecking(true)
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    navigate('/login', { replace: true })
                    return
                }

                const { data: usuario } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id_usuario', user.id)
                    .single()

                if (usuario?.aprobado) {
                    // Si ya fue aprobado, redirigir al dashboard
                    navigate('/dashboard', { replace: true })
                } else {
                    setUserData(usuario)
                }
            } catch (error) {
                console.error('Error al verificar aprobación:', error)
            } finally {
                setChecking(false)
            }
        }

        checkApproval()

        // Polling cada 30 segundos para verificar si fue aprobado
        const interval = setInterval(checkApproval, 30000)

        return () => clearInterval(interval)
    }, [navigate])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        navigate('/login', { replace: true })
    }

    const handleCheckNow = async () => {
        setChecking(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            navigate('/login', { replace: true })
            return
        }

        const { data: usuario } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id_usuario', user.id)
            .single()

        if (usuario?.aprobado) {
            navigate('/dashboard', { replace: true })
        }
        setChecking(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-yellow-500">
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>

                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Cuenta Pendiente de Aprobación
                    </h2>

                    <div className="mt-4 text-sm text-gray-600 space-y-2">
                        <p>
                            Hola <strong>{userData?.nombre}</strong>,
                        </p>
                        <p>
                            Tu cuenta ha sido creada exitosamente, pero necesita ser aprobada
                            por un administrador antes de que puedas acceder al sistema.
                        </p>
                        <p className="mt-4">
                            Recibirás un correo electrónico a <strong>{userData?.email}</strong> cuando
                            tu cuenta sea aprobada.
                        </p>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-700">
                            💡 Este proceso generalmente toma menos de 24 horas hábiles.
                        </p>
                    </div>

                    <div className="mt-6 space-y-3">
                        <button
                            onClick={handleCheckNow}
                            disabled={checking}
                            className="w-full px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {checking ? 'Verificando...' : 'Verificar Estado Ahora'}
                        </button>

                        <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}