/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HealthCheckResponse {
  status: string;
  database: string;
}

export interface User {
  user_id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        errorMessage = Array.isArray(errorData.detail)
          ? errorData.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
          : errorData.detail;
      }
    } catch {
      // JSON parsing failed, use fallback message
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const taskApi = {
  /**
   * Check connection health of FastAPI server and database.
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<HealthCheckResponse>(response);
  },

  /**
   * Fetch list of user accounts, optionally filtered by username (with wildcards).
   */
  async getUsers(username?: string): Promise<User[]> {
    let url = `${API_BASE_URL}/users`;
    if (username) {
      url += `?username=${encodeURIComponent(username)}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<User[]>(response);
  },
};
