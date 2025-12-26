import { supabase } from '@/lib/supabase';
import type { InventoryParams, PaginatedInventoryResponse, InventoryItem } from './types';

const id_localizacion = localStorage.getItem('minca_location_id');

/**
 * Fetches paginated inventory data from Supabase view v_inventario_completo
 */
export async function getInventory(
  params: InventoryParams = {}
): Promise<PaginatedInventoryResponse> {
  const {
    page = 1,
    limit = 10,
    order_by = 'referencia',
    direction = 'asc',
    search,
    estado_stock,
    descontinuado,
  } = params;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Start building the query
  let query = supabase
    .from('v_inventario_completo')
    .select('*', { count: 'exact' })
    .eq('id_localizacion', id_localizacion);

  // Apply search filter (search in nombre or referencia)
  if (search && search.trim()) {
    query = query.or(`nombre.ilike.%${search}%,referencia.ilike.%${search}%`);
  }

  // Apply estado_stock filter
  if (estado_stock && estado_stock !== 'all') {
    query = query.eq('estado_stock', estado_stock);
  }

  // Apply descontinuado filter
  if (descontinuado !== undefined) {
    query = query.eq('descontinuado', descontinuado);
  }

  // Apply ordering
  query = query.order(order_by, { ascending: direction === 'asc' });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  // Execute query
  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching inventory:', error);
    throw new Error(error.message);
  }

  // Calculate total pages
  const totalCount = count || 0;
  const pageCount = Math.ceil(totalCount / limit);

  return {
    items: (data as InventoryItem[]) || [],
    total_count: totalCount,
    page,
    limit,
    page_count: pageCount,
  };
}

/**
 * Get all inventory items (for autocomplete or dropdowns)
 */
export async function getAllInventoryItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('v_inventario_completo')
    .select('*')
    .eq('id_localizacion', id_localizacion)
    .order('nombre', { ascending: true })
    .limit(1000);

  if (error) {
    console.error('Error fetching all inventory items:', error);
    throw new Error(error.message);
  }

  return (data as InventoryItem[]) || [];
}
/**
 * Fetches the history of inventory counts from the 'conteo' table.
 */
export async function getCountHistory() {
  const { data, error } = await supabase
    .from('conteo')
    .select('fecha, tipo, usuario')
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error fetching count history:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Sends the processed inventory count data to the backend.
 * This is a placeholder and will call a Supabase function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendCountData(processedData: any, type: 'completo' | 'parcial') {
  const { data, error } = await supabase.rpc('funcion_conteo', {
    items: processedData,
    tipo_conteo: type,
  });

  if (error) {
    console.error('Error sending count data:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Create a new inventory item
 */
export async function createInventoryItem(data: { id_repuesto: string, id_localizacion: string, cantidad: number, posicion?: string, nuevo_hasta?: string }) {
  const { error } = await supabase
    .from('inventario')
    .insert(data);

  if (error) {
    console.error('Error creating inventory item:', error);
    throw new Error(error.message);
  }
}

/**
 * Update inventory item complete using RPC
 */
export async function updateItemComplete(
  id_inventario: string,
  stock_actual: number,
  posicion: string,
  cantidad_minima: number,
  descontinuado: boolean,
  tipo: string,
  fecha_estimada: string | null,
  nuevo_hasta: string | null = null
) {
  const { data, error } = await supabase.rpc('actualizar_item_inventario', {
    p_id_inventario: id_inventario,
    p_stock_actual: stock_actual,
    p_posicion: posicion,
    p_cantidad_minima: cantidad_minima,
    p_descontinuado: descontinuado,
    p_tipo: tipo,
    p_fecha_estimada: fecha_estimada,
    p_nuevo_hasta: nuevo_hasta
  });

  if (error) {
    console.error('Error updating inventory item complete:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Search inventory items by query
 */
export async function searchInventoryItems(query: string): Promise<InventoryItem[]> {
  if (!query.trim()) {
    return [];
  }

  const { data, error } = await supabase
    .from('v_inventario_completo')
    .select('*')
    .eq('id_localizacion', id_localizacion)
    .or(`nombre.ilike.%${query}%,referencia.ilike.%${query}%`)
    .limit(50);

  if (error) {
    console.error('Error searching inventory:', error);
    throw new Error(error.message);
  }

  return (data as InventoryItem[]) || [];
}

/**
 * Search repuestos by query
 */
export async function searchRepuestos(query: string, id_localizacion: string): Promise<InventoryItem[]> {
  if (!query.trim()) {
    return [];
  }

  const tableName = id_localizacion ? 'v_inventario_completo' : 'repuestos';

  let queryBuilder = supabase
    .from(tableName)
    .select('*');

  if (id_localizacion) {
    queryBuilder = queryBuilder.eq('id_localizacion', id_localizacion);
  }

  const { data, error } = await queryBuilder
    .or(`nombre.ilike.%${query}%,referencia.ilike.%${query}%`)
    .limit(50);

  if (error) {
    console.error('Error searching repuestos:', error);
    throw new Error(error.message);
  }

  return (data as InventoryItem[]) || [];
}

