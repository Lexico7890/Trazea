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

// API functions for movements

// Create a movement
export async function createMovement(movement: Movement): Promise<unknown> {
  return fetchAPI<unknown>('/movements', {
    method: 'POST',
    body: JSON.stringify(movement),
  });
}

export { BACKEND_URL };