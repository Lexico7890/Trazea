import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/useUserStore';
import { fetchUserSessionData } from '@/features/login/utils/auth-utils';
import { toast } from 'sonner';

export const useSupabaseAuthListener = () => {
  const setSessionData = useUserStore((state) => state.setSessionData);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log('Auth event:', event, session);

      if (event === 'PASSWORD_RECOVERY') {
        // User clicked the reset link and is now implicitly signed in (session exists)
        // We need to hydrate the store with user data so they can access protected routes (like update password)
        if (session?.user) {
             try {
                const sessionData = await fetchUserSessionData(session.user);
                setSessionData(sessionData);
                // We might want to notify or just let the flow continue
             } catch (error) {
                 console.error("Error hydrating user on recovery:", error);
                 toast.error("Error al cargar datos de usuario.");
             }
        }
      }
      // Note: We might also want to handle SIGNED_IN if we want to sync other tabs or external login flows
      // But for now, existing login uses explicit setSessionData, so we avoid double fetching if not needed.
      // However, if the session is restored from local storage by Supabase (refresh), we might want to ensure consistency.
      // For this specific task (password recovery), PASSWORD_RECOVERY is the key event.
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSessionData]);
};
