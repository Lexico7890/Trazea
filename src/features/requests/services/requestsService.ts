import { supabase } from '@/lib/supabase';
import type { Destination, CartItem } from '../types';

export async function getLocations(): Promise<Destination[]> {
  const { data, error } = await supabase
    .from('localizacion')
    .select('id_localizacion, nombre');

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
  items: Array<{ id_repuesto: string; cantidad: number }>;
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
    cantidad_solicitada: item.cantidad,
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

// --- Cart Operations ---

export async function getCartItems(locationId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from('v_carrito_detallado')
    .select('*')
    .eq('id_localizacion', locationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }

  return data || [];
}

export async function addCartItem(
  userId: string,
  locationId: string,
  repuestoId: string,
  quantity: number = 1
): Promise<void> {
  // We use upsert to handle potential duplicates if desired, or just insert and catch error.
  // Given user instruction "no valides que si se crea doble", we will try to insert.
  // The unique constraint (id_usuario, id_repuesto) will trigger an error if we duplicate.
  // We can use upsert to update quantity or ignore.
  // Let's use simple insert first, if it fails we might handle it.
  // Actually, upserting with ON CONFLICT DO NOTHING is safe.

  const { error } = await supabase
    .from('carrito_solicitudes')
    .upsert(
      {
        id_usuario: userId,
        id_localizacion: locationId,
        id_repuesto: repuestoId,
        cantidad: quantity,
      },
      { onConflict: 'id_usuario, id_repuesto', ignoreDuplicates: true }
    );

  if (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

export async function removeCartItem(cartItemId: string): Promise<void> {
  const { error } = await supabase
    .from('carrito_solicitudes')
    .delete()
    .eq('id_item_carrito', cartItemId);

  if (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
}

export async function bulkRemoveCartItems(cartItemIds: string[]): Promise<void> {
  if (cartItemIds.length === 0) return;

  const { error } = await supabase
    .from('carrito_solicitudes')
    .delete()
    .in('id_item_carrito', cartItemIds);

  if (error) {
    console.error('Error bulk removing cart items:', error);
    throw error;
  }
}
