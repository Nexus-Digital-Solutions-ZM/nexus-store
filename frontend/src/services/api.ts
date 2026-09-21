export const api = {
  baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3000",

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  },
};
