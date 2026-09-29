const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: 'UNKNOWN_ERROR',
      message: 'Something went wrong.',
    }))

    throw new Error(errorData.message || 'Something went wrong.')
  }

  return response.json()
}