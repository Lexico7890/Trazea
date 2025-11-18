// API client configuration and helper functions

const BACKEND_URL = 'https://aux-backend-snlq.onrender.com';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

// Types
export interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  location_id: number | null;
  min_stock: number | null;
  current_stock: number | null;
  stock: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaginatedResponse<T> {
  total_count: number;
  page_count: number;
  limit: number;
  page: number;
  items: T[];
}

export interface InventoryParams {
  page?: number;
  limit?: number;
  order_by?: string;
  direction?: 'asc' | 'desc';
}

export interface Movement {
  item_id: string;
  movement_type: string;
  quantity: number;
  from_location_id: number;
  to_location_id: number;
  reason: string;
  notes: string;
  performed_by: string;
  order_number: number | null;
}

// API functions

// Get paginated inventory
export async function getInventory(
  params: InventoryParams = {}
): Promise<PaginatedResponse<InventoryItem>> {
  const searchParams = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || 10),
    order_by: params.order_by || 'created_at',
    direction: params.direction || 'desc',
  });

  return fetchAPI<PaginatedResponse<InventoryItem>>(
    `/inventory/?${searchParams.toString()}`
  );
}

// Get all inventory items (for autocomplete)
export async function getAllInventoryItems(): Promise<InventoryItem[]> {
  const response = await fetchAPI<PaginatedResponse<InventoryItem>>(
    '/inventory/?limit=1000'
  );
  return response.items;
}

// Create a movement
export async function createMovement(movement: Movement): Promise<unknown> {
  return fetchAPI<unknown>('/movements', {
    method: 'POST',
    body: JSON.stringify(movement),
  });
}

// Get inventory item by ID
export async function getInventoryItem(id: string): Promise<InventoryItem> {
  return fetchAPI<InventoryItem>(`/inventory/${id}`);
}

// Update inventory item
export async function updateInventoryItem(
  id: string,
  data: Partial<InventoryItem>
): Promise<InventoryItem> {
  return fetchAPI<InventoryItem>(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Create inventory item
// src/lib/api.ts
export async function createInventoryItem(item: {
  id: string;
  name: string;
  description?: string;
  category?: string;
  stock: number;
  min_stock: number;
}): Promise<InventoryItem> {
  const backendUrl = "https://aux-backend-snlq.onrender.com";
  
  const response = await fetch(`${backendUrl}/inventory/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...item,
      location_id: 10, // O tómalo del store
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      detail: "Error desconocido del servidor." 
    }));
    throw new Error(errorData.detail || errorData.message || 'Fallo en la creación');
  }

  return response.json();
}

// Search inventory items
export async function searchInventoryItems(query: string): Promise<InventoryItem[]> {
  if (!query.trim()) {
    return [];
  }
  return fetchAPI<InventoryItem[]>(`/inventory/search?q=${encodeURIComponent(query)}`);
}

export { BACKEND_URL };