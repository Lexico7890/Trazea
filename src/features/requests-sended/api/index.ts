import { supabase } from "@/shared/api";

export interface ReceivedRequest {
  id_solicitud: string;
  id_localizacion_origen: string;
  id_localizacion_destino: string;
  id_usuario_solicitante: string;
  fecha_creacion: string;
  estado: string;
  observaciones_generales: string | null;
  items: ReceivedRequestItem[];
  origen: { nombre: string }; // joined from localizacion table
}

export interface ReceivedRequestItem {
  id_repuesto: string;
  cantidad: number; // Original requested
  status?: boolean; // Sent status
  cantidad_enviada?: number; // Quantity sent
}

export async function getReceivedRequests(locationId: string): Promise<ReceivedRequest[]> {
  const { data, error } = await supabase
    .from('solicitudes')
    .select('*')
    .eq('id_localizacion_destino', locationId)
    .order('fecha_creacion', { ascending: false });

  if (error) {
    console.error('Error fetching received requests:', error);
    throw error;
  }

  // Obtenemos localizaciones para cruzar el nombre sin depender de Foreign Keys estrictas que puedan arrojar PGRST200
  const { data: locations } = await supabase
    .from('localizacion')
    .select('id_localizacion, nombre');

  const locMap = (locations || []).reduce((acc: any, loc: any) => {
    acc[loc.id_localizacion] = loc.nombre;
    return acc;
  }, {});

  return (data || []).map(req => {
    let parsedItems = req.items || [];
    if (typeof parsedItems === 'string') {
      try {
        parsedItems = JSON.parse(parsedItems);
      } catch (e) {
        parsedItems = [];
      }
    }

    return {
      ...req,
      items: parsedItems,
      origen: { nombre: locMap[req.id_localizacion_origen] || 'Sede Desconocida' }
    };
  }) as ReceivedRequest[];
}

export async function processReceivedRequest(
  requestId: string,
  updatedItems: ReceivedRequestItem[]
): Promise<void> {
  const { error } = await supabase
    .from('solicitudes')
    .update({ 
      estado: 'enviado',
      items: updatedItems,
      // You can add logic for id_usuario_alistador or fecha_alistamiento if the schema allows
    })
    .eq('id_solicitud', requestId);

  if (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
}

export async function getRepuestosByIds(ids: string[]) {
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from('repuestos')
    .select('id_repuesto, nombre, referencia')
    .in('id_repuesto', ids);

  if (error) {
    console.error('Error fetching repuestos dict:', error);
    throw error;
  }
  return data || [];
}
