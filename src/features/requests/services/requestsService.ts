import { supabase } from '@/lib/supabase';
import type { Destination } from '../store/useRequestsStore';

export async function getLocations(): Promise<Destination[]> {
  const { data, error } = await supabase
    .from('localizacion')
    .select('id_localizacion, nombre, telefono');

  if (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }

  return data || [];
}

export interface CreateRequestData {
  id_localizacion_origen: string;
  id_localizacion_destino: string;
  id_usuario_solicitante: string;
  observaciones_generales: string;
  items: Array<{ id_repuesto: string }>;
}

export interface RequestHistoryItem {
  id_solicitud: string;
  fecha_creacion: string;
  estado: string;
  observaciones_generales: string;
  id_localizacion_destino: number;
  nombre_destino: string;
  id_localizacion_origen: number;
  nombre_origen: string;
  id_usuario_solicitante: string;
  nombre_solicitante: string;
}

export async function createRequest(requestData: CreateRequestData): Promise<void> {
  // Step 1.1: Insert into solicitudes table
  const { data: solicitudData, error: solicitudError } = await supabase
    .from('solicitudes')
    .insert({
      id_localizacion_origen: requestData.id_localizacion_origen,
      id_localizacion_destino: requestData.id_localizacion_destino,
      id_usuario_solicitante: requestData.id_usuario_solicitante,
      estado: 'pendiente',
      observaciones_generales: requestData.observaciones_generales,
    })
    .select('id_solicitud')
    .single();

  if (solicitudError) {
    console.error('Error creating solicitud:', solicitudError);
    throw solicitudError;
  }

  // Step 1.2: Insert into detalles_solicitud table (bulk insert)
  const detalles = requestData.items.map(item => ({
    id_solicitud: solicitudData.id_solicitud,
    id_repuesto: item.id_repuesto,
    cantidad_solicitada: 1, // Default quantity is 1
  }));

  const { error: detallesError } = await supabase
    .from('detalles_solicitud')
    .insert(detalles);

  if (detallesError) {
    console.error('Error creating detalles_solicitud:', detallesError);
    throw detallesError;
  }
}

export async function getRequestHistory(): Promise<RequestHistoryItem[]> {
  const { data, error } = await supabase
    .from('v_historial_solicitudes')
    .select('*')
    .order('fecha_creacion', { ascending: false });

  if (error) {
    console.error('Error fetching request history:', error);
    throw error;
  }

  return data || [];
}
