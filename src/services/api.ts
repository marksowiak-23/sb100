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

  /**
   * Fetch member profile by their associated user ID.
   */
  async getMemberByUserId(userId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbrs/user/${userId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<any>(response);
  },

  /**
   * Update an existing member profile record.
   */
  async updateMember(mbrId: string, member: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbrs/${mbrId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(member),
    });
    return handleResponse<any>(response);
  },

  /**
   * Fetch list of family members for a given member ID.
   */
  async getFamilyMembers(mbrId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-families/member/${mbrId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<any[]>(response);
  },

  /**
   * Create a new family member record.
   */
  async createFamilyMember(familyMember: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-families`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(familyMember),
    });
    return handleResponse<any>(response);
  },

  /**
   * Update an existing family member record.
   */
  async updateFamilyMember(mbrFamilyId: string, familyMember: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-families/${mbrFamilyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(familyMember),
    });
    return handleResponse<any>(response);
  },

  /**
   * Delete a family member record.
   */
  async deleteFamilyMember(mbrFamilyId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-families/${mbrFamilyId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<any>(response);
  },

  /**
   * Fetch lookup codes by category tag.
   */
  async getLookupCodes(tag: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/cds?tag=${encodeURIComponent(tag)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<any[]>(response);
  },

  /**
   * Fetch all residences for a given member.
   */
  async getResidences(mbrId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-residences/member/${mbrId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<any[]>(response);
  },

  /**
   * Create a new residence record.
   */
  async createResidence(residence: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-residences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(residence),
    });
    return handleResponse<any>(response);
  },

  /**
   * Update an existing residence record.
   */
  async updateResidence(mbrResidenceId: string, residence: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-residences/${mbrResidenceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(residence),
    });
    return handleResponse<any>(response);
  },

  /**
   * Delete a residence record.
   */
  async deleteResidence(mbrResidenceId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-residences/${mbrResidenceId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<any>(response);
  },
};


