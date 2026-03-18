import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/shared/api/supabase';
import type { Notification } from '../model/types';
import { toast } from 'sonner';
import { useUserStore } from '@/entities/user';

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
  const locationId = currentLocation?.id_localizacion;
  const isTechnician = hasRole('tecnico');

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);

      let query = supabase
        .from('notificaciones')
        .select('*')
        .order('fecha_creacion', { ascending: false })
        .limit(10);

      if (locationId) {
        query = query.eq('id_localizacion', locationId);
      } else if (userId) {
        // Fallback en caso de que aún no haya una locación seleccionada
        query = query.eq('id_usuario', userId);
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
  }, [userId, locationId]);

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n.id_notificacion === notificationId ? { ...n, leida: true } : n)
      );

      const { data, error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id_notificacion', notificationId)
        .select();

      if (error) {
        // Revert on error
        setNotifications(prev =>
          prev.map(n => n.id_notificacion === notificationId ? { ...n, leida: false } : n)
        );
        throw error;
      }

      if (!data || data.length === 0 || isTechnician) {
        // RLS silenciosamente ignoró el UPDATE
        setNotifications(prev =>
          prev.map(n => n.id_notificacion === notificationId ? { ...n, leida: false } : n)
        );
        console.warn("RLS bloqueó el UPDATE o la notificación ya no existe.");
        toast.error('No tienes permiso para actualizar esta notificación');
        return;
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

          // Validar si la notificación pertenece a la ubicación actual
          const isRelevant = locationId && newOrUpdatedNotif.id_localizacion === locationId;

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
  }, [userId, locationId, fetchNotifications]); // Re-subscribe if user context changes

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    fetchNotifications
  };
};
