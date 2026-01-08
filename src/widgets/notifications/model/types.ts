export interface Notification {
  id_notificacion: string;
  id_usuario: string | null;
  id_localizacion: string | null;
  titulo: string;
  mensaje: string;
  tipo: string;
  prioridad: string;
  leida: boolean;
  fecha_creacion: string;
  data: Record<string, unknown> | null;
}
