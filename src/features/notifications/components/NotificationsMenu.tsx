import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotifications } from '../hooks/useNotifications';
import { cn } from '@/lib/utils';

export const NotificationsMenu = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold">Notificaciones</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} nueva{unreadCount !== 1 && 's'}
            </span>
          )}
        </div>
        <div className="max-h-[80vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No tienes notificaciones
            </div>
          ) : (
            <div className="grid">
              {notifications.map((notification) => (
                <button
                  key={notification.id_notificacion}
                  onClick={() => !notification.leida && markAsRead(notification.id_notificacion)}
                  className={cn(
                    "flex w-full flex-col gap-1 border-b p-4 text-left transition-colors hover:bg-muted/50 last:border-0",
                    !notification.leida && "bg-muted/30"
                  )}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className={cn(
                      "text-sm font-medium leading-none",
                      !notification.leida && "font-semibold text-primary"
                    )}>
                      {notification.titulo}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.fecha_creacion), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.mensaje}
                  </p>
                  {!notification.leida && (
                    <span className="mt-1 flex items-center gap-1.5 text-xs text-blue-500 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        Nueva
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
