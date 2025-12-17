import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/useUserStore';
import { Notification } from '../types';
import { toast } from 'sonner';

export const useNotifications = () => {
  const { sessionData, currentLocation, hasRole } = useUserStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Derived state
  const unreadCount = useMemo(() =>
    notifications.filter(n => !n.leida).length,
  [notifications]);

  // Determine current user and location IDs
  const userId = sessionData?.user?.id;
  const locationId = currentLocation?.id_localizacion; // Adjusted based on context, usually id_localizacion in this codebase
  const isTechnician = hasRole('tecnico');

  // Fetch initial notifications
  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);

      let query = supabase
        .from('notificaciones')
        .select('*')
        .order('fecha_creacion', { ascending: false })
        .limit(50); // Limit to last 50 for performance

      // Apply filtering logic
      if (isTechnician) {
        // Technicians only see their own notifications
        query = query.eq('id_usuario', userId);
      } else {
        // Others see their own OR their location's notifications
        // Syntax for OR in Supabase: .or(`col1.eq.val1,col2.eq.val2`)
        if (locationId) {
          query = query.or(`id_usuario.eq.${userId},id_localizacion.eq.${locationId}`);
        } else {
          // Fallback if no location selected (though app usually requires it)
          query = query.eq('id_usuario', userId);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setNotifications(data as Notification[]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // toast.error('Error al cargar notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n.id_notificacion === notificationId ? { ...n, leida: true } : n)
      );

      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id_notificacion', notificationId);

      if (error) {
        // Revert on error
        setNotifications(prev =>
            prev.map(n => n.id_notificacion === notificationId ? { ...n, leida: false } : n)
        );
        throw error;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('No se pudo marcar como leída');
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT and UPDATE
          schema: 'public',
          table: 'notificaciones',
        },
        (payload) => {
          const newOrUpdatedNotif = payload.new as Notification;

          // Filter incoming events based on our logic (Client-side filtering for Realtime)
          // RLS might handle this, but explicit check is safer if RLS is broad
          const belongsToUser = newOrUpdatedNotif.id_usuario === userId;
          const belongsToLocation = locationId && newOrUpdatedNotif.id_localizacion === locationId;

          // Logic:
          // If technician: must belong to user.
          // If not technician: must belong to user OR location.
          const isRelevant = isTechnician
            ? belongsToUser
            : (belongsToUser || belongsToLocation);

          if (!isRelevant) return;

          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [newOrUpdatedNotif, ...prev]);
            toast.info(`Nueva notificación: ${newOrUpdatedNotif.titulo}`);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev =>
              prev.map(n => n.id_notificacion === newOrUpdatedNotif.id_notificacion ? newOrUpdatedNotif : n)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, locationId, isTechnician]); // Re-subscribe if user context changes

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    fetchNotifications
  };
};
