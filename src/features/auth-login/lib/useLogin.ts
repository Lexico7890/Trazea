import { useState } from 'react';
import { toast as sonnerToast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/entities/user';
import { fetchUserSessionData, supabase } from '@/shared/api';
import { handleSupabaseError } from '@/shared/lib';

export const useLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const setSessionData = useUserStore((state) => state.setSessionData);
    const clearUser = useUserStore((state) => state.clearUser);
    const navigate = useNavigate();

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                handleSupabaseError(error);
                return;
            }

            if (data.session && data.user) {
                const sessionData = await fetchUserSessionData(data.user);
                setSessionData(sessionData);

                sonnerToast.success('Bienvenido de nuevo');
            }
        } catch (error) {
            handleSupabaseError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                handleSupabaseError(error);
                return;
            }

            localStorage.removeItem('minca_location_id');
            clearUser();
            sonnerToast.success('Sesión cerrada exitosamente');
            navigate('/login');
        } catch (error) {
            handleSupabaseError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (email: string) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) {
                handleSupabaseError(error);
                return;
            }

            sonnerToast.success('Correo de recuperación enviado. Revisa tu bandeja de entrada.');
        } catch (error) {
            handleSupabaseError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        setIsGoogleLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth-callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) {
                handleSupabaseError(error);
                return;
            }

            // El redireccionamiento ocurrirá automáticamente
            sonnerToast.success('Redirigiendo a Google...');
        } catch (error) {
            handleSupabaseError(error);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const updatePassword = async (password: string) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) {
                handleSupabaseError(error);
                return;
            }

            sonnerToast.success('Contraseña actualizada exitosamente');
            navigate('/'); // Navigate to dashboard
        } catch (error) {
            handleSupabaseError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        login,
        logout,
        resetPassword,
        updatePassword,
        loginWithGoogle,
        isLoading,
        isGoogleLoading,
    };
};
