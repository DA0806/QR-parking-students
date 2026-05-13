import { API_URL } from './api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `API Error: ${response.status}` }));
      throw new Error(error.error || `API Error: ${response.status}`);
    }
    return response.json();
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `API Error: ${response.status}` }));
      throw new Error(error.error || `API Error: ${response.status}`);
    }
    return response.json();
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `API Error: ${response.status}` }));
      throw new Error(error.error || `API Error: ${response.status}`);
    }
    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `API Error: ${response.status}` }));
      throw new Error(error.error || `API Error: ${response.status}`);
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();
