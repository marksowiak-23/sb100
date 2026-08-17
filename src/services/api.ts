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
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MbrStory {
  mbrStoryId: string;
  mbrStoryTypeCd: string;
  mbrStoryPublishStatusCd: string;
  mbrStoryTitle: string;
  mbrStoryContent?: string;
  mbrStoryVersion: number;
  mbrStoryStartDate?: string;
  mbrStoryEndDate?: string;
  mbrStoryCreatedAt: string;
  mbrStoryUpdatedAt: string;
  mbrStoryThreadID?: string;
  mbrStorySubordinateId?: string;
  mbrMbrId: string;
  chIntentId?: string;
  mbrStoryOriginalId?: string;
}

export interface MbrMedia {
  mbrMediaId: string;
  mbrId: string;
  mbrMediaSubordinateId?: string;
  mbrMediaPath: string;
  mbrMediaOriginalFilename?: string;
  mbrMediaMimeType?: string;
  mbrMediaCategoryCd?: string;
  mbrMediaDescription?: string;
  mbrMediaCreatedAt?: string;
  mbrMediaUpdatedAt?: string;
}

export interface SignedUrlResponse {
  bucket: string;
  object_name: string;
  signed_url: string;
  method: string;
  expiration_minutes: number;
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
   * Fetch list of user accounts, optionally filtered by email (with wildcards).
   */
  async getUsers(email?: string): Promise<User[]> {
    let url = `${API_BASE_URL}/users`;
    if (email) {
      url += `?email=${encodeURIComponent(email)}`;
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
   * Fetch a user account by email address.
   */
  async getUserByEmail(email: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<User>(response);
  },

  /**
   * Fetch member profile by their associated user ID.
   */
  async getMemberByUserId(userId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbrs/user/${userId}?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache'
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
    const response = await fetch(`${API_BASE_URL}/mbr-families/member/${mbrId}?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache'
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
   * Fetch list of story craft writer personas.
   */
  async getChWriters(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/chWriters?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    return handleResponse<any[]>(response);
  },

  /**
   * Fetch preferences for a given member ID.
   */
  async getMemberPreferences(mbrId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-preferences/member/${mbrId}?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    return handleResponse<any>(response);
  },

  /**
   * Save member preferences (Create or Update).
   */
  async saveMemberPreferences(mbrPrefId: string | null, payload: any): Promise<any> {
    const method = mbrPrefId ? 'PUT' : 'POST';
    const url = mbrPrefId ? `${API_BASE_URL}/mbr-preferences/${mbrPrefId}` : `${API_BASE_URL}/mbr-preferences`;
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
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
    const response = await fetch(`${API_BASE_URL}/mbr-residences/member/${mbrId}?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache'
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

  /**
   * Fetch all activities for a given member.
   */
  async getActivities(mbrId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-activities/member/${mbrId}?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache'
    });
    return handleResponse<any[]>(response);
  },

  /**
   * Create a new activity record.
   */
  async createActivity(activity: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(activity),
    });
    return handleResponse<any>(response);
  },

  /**
   * Update an existing activity record.
   */
  async updateActivity(mbrActivityId: string, activity: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-activities/${mbrActivityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(activity),
    });
    return handleResponse<any>(response);
  },

  /**
   * Delete an activity record.
   */
  async deleteActivity(mbrActivityId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-activities/${mbrActivityId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<any>(response);
  },

  /**
   * Fetch all achievements for a given member.
   */
  async getAchievements(mbrId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-achievements/member/${mbrId}?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache'
    });
    return handleResponse<any[]>(response);
  },

  /**
   * Create a new achievement record.
   */
  async createAchievement(achievement: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-achievements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(achievement),
    });
    return handleResponse<any>(response);
  },

  /**
   * Update an existing achievement record.
   */
  async updateAchievement(mbrAchievementId: string, achievement: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-achievements/${mbrAchievementId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(achievement),
    });
    return handleResponse<any>(response);
  },

  /**
   * Delete an achievement record.
   */
  async deleteAchievement(mbrAchievementId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-achievements/${mbrAchievementId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<any>(response);
  },

  /**
   * Fetch all education records for a given member.
   */
  async getEducations(mbrId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-educations/member/${mbrId}?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache'
    });
    return handleResponse<any[]>(response);
  },

  /**
   * Create a new education record.
   */
  async createEducation(education: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-educations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(education),
    });
    return handleResponse<any>(response);
  },

  /**
   * Update an existing education record.
   */
  async updateEducation(mbrEducationId: string, education: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-educations/${mbrEducationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(education),
    });
    return handleResponse<any>(response);
  },

  /**
   * Delete an education record.
   */
  async deleteEducation(mbrEducationId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-educations/${mbrEducationId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<any>(response);
  },

  /**
   * Fetch all employment records for a given member.
   */
  async getEmployments(mbrId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-employments/member/${mbrId}?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache'
    });
    return handleResponse<any[]>(response);
  },

  /**
   * Create a new employment record.
   */
  async createEmployment(employment: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-employments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(employment),
    });
    return handleResponse<any>(response);
  },

  /**
   * Update an existing employment record.
   */
  async updateEmployment(mbrEmploymentId: string, employment: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-employments/${mbrEmploymentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(employment),
    });
    return handleResponse<any>(response);
  },

  /**
   * Delete an employment record.
   */
  async deleteEmployment(mbrEmploymentId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbr-employments/${mbrEmploymentId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<any>(response);
  },

  /**
   * Fetch all stories for a given member.
   */
  async getStories(mbrId: string): Promise<MbrStory[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-stories/member/${mbrId}?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache'
    });
    return handleResponse<MbrStory[]>(response);
  },

  /**
   * Create a new member story record.
   */
  async createStory(story: Partial<MbrStory>): Promise<MbrStory> {
    const response = await fetch(`${API_BASE_URL}/mbr-stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(story),
    });
    return handleResponse<MbrStory>(response);
  },

  /**
   * Update an existing story record.
   */
  async updateStory(mbrStoryId: string, story: Partial<MbrStory>): Promise<MbrStory> {
    const response = await fetch(`${API_BASE_URL}/mbr-stories/${mbrStoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(story),
    });
    return handleResponse<MbrStory>(response);
  },

  /**
   * Delete a story record.
   */
  async deleteStory(mbrStoryId: string): Promise<MbrStory> {
    const response = await fetch(`${API_BASE_URL}/mbr-stories/${mbrStoryId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MbrStory>(response);
  },

  /**
   * Fetch all media records for a specific member ID.
   */
  async getMemberMedia(mbrId: string): Promise<MbrMedia[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-media/member/${mbrId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MbrMedia[]>(response);
  },

  /**
   * Fetch a single member media record by ID.
   */
  async getMemberMediaById(mbrMediaId: string): Promise<MbrMedia> {
    const response = await fetch(`${API_BASE_URL}/mbr-media/${mbrMediaId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MbrMedia>(response);
  },

  /**
   * Create a new member media record.
   */
  async createMemberMedia(mbrMedia: Partial<MbrMedia>): Promise<MbrMedia> {
    const response = await fetch(`${API_BASE_URL}/mbr-media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(mbrMedia),
    });
    return handleResponse<MbrMedia>(response);
  },

  /**
   * Update an existing member media record.
   */
  async updateMemberMedia(mbrMediaId: string, mbrMedia: Partial<MbrMedia>): Promise<MbrMedia> {
    const response = await fetch(`${API_BASE_URL}/mbr-media/${mbrMediaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(mbrMedia),
    });
    return handleResponse<MbrMedia>(response);
  },

  /**
   * Delete a member media record.
   */
  async deleteMemberMedia(mbrMediaId: string): Promise<MbrMedia> {
    const response = await fetch(`${API_BASE_URL}/mbr-media/${mbrMediaId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MbrMedia>(response);
  }
};


export const adminDbApi = {
  async getTableData(endpoint: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<any[]>(response);
  },

  async getRecord(endpoint: string, id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<any>(response);
  },

  async createRecord(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  async updateRecord(endpoint: string, id: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  async deleteRecord(endpoint: string, id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<any>(response);
  },

  async clearCache(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/cache/clear`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<{ status: string; message: string }>(response);
  },

  /**
   * Fetch all media records for a specific member ID.
   */
  async getMemberMedia(mbrId: string): Promise<MbrMedia[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-media/member/${mbrId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MbrMedia[]>(response);
  },

  /**
   * Fetch a single member media record by ID.
   */
  async getMemberMediaById(mbrMediaId: string): Promise<MbrMedia> {
    const response = await fetch(`${API_BASE_URL}/mbr-media/${mbrMediaId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MbrMedia>(response);
  },

  /**
   * Create a new member media record.
   */
  async createMemberMedia(mbrMedia: Partial<MbrMedia>): Promise<MbrMedia> {
    const response = await fetch(`${API_BASE_URL}/mbr-media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(mbrMedia),
    });
    return handleResponse<MbrMedia>(response);
  },

  /**
   * Update an existing member media record.
   */
  async updateMemberMedia(mbrMediaId: string, mbrMedia: Partial<MbrMedia>): Promise<MbrMedia> {
    const response = await fetch(`${API_BASE_URL}/mbr-media/${mbrMediaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(mbrMedia),
    });
    return handleResponse<MbrMedia>(response);
  },

  /**
   * Delete a member media record.
   */
  async deleteMemberMedia(mbrMediaId: string): Promise<MbrMedia> {
    const response = await fetch(`${API_BASE_URL}/mbr-media/${mbrMediaId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MbrMedia>(response);
  }
};

export interface ChatResponse {
  response: string;
  thread_id: string;
}

const AI_API_BASE_URL = import.meta.env.VITE_API_URL_AI || 'http://localhost:8002';

export const chatApi = {
  /**
   * Send a chat message to Cassie the Story Mate via the FastAPI AI service.
   */
  async sendMessage(message: string, threadId: string, memberName?: string): Promise<ChatResponse> {
    const response = await fetch(`${AI_API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message,
        thread_id: threadId,
        member_name: memberName
      }),
    });
    return handleResponse<ChatResponse>(response);
  },

  /**
   * Check connection health of FastAPI AI service.
   */
  async checkHealth(): Promise<{ status: string; service: string }> {
    const response = await fetch(`${AI_API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<{ status: string; service: string }>(response);
  }
};

export interface MediaObject {
  name: string;
  size: number;
  content_type: string;
  updated: string;
  public_url: string;
  metadata?: Record<string, any>;
}

export interface MediaListResponse {
  bucket: string;
  count: number;
  items: MediaObject[];
}

export interface MediaUploadResponse {
  message: string;
  data: MediaObject;
}

export interface SignedUrlResponse {
  bucket: string;
  object_name: string;
  signed_url: string;
  method: string;
  expiration_minutes: number;
}

const MEDIA_API_BASE_URL = import.meta.env.VITE_API_URL_MEDIA || 'http://localhost:8003';

export const mediaApi = {
  /**
   * Check connection health of FastAPI Media service.
   */
  async checkHealth(): Promise<{ status: string; service: string; bucket: string; bucket_status: string }> {
    const response = await fetch(`${MEDIA_API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<{ status: string; service: string; bucket: string; bucket_status: string }>(response);
  },

  /**
   * Upload an image/media file to Cloud Storage via sb-api-media.
   */
  async uploadMedia(file: File, destinationPath?: string): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (destinationPath && destinationPath.trim() !== '') {
      formData.append('destination_path', destinationPath.trim());
    }
    const response = await fetch(`${MEDIA_API_BASE_URL}/media/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<MediaUploadResponse>(response);
  },

  /**
   * List media objects in GCS bucket with optional prefix and max results limit.
   */
  async listMedia(prefix?: string, maxResults: number = 100): Promise<MediaListResponse> {
    let url = `${MEDIA_API_BASE_URL}/media/list?max_results=${maxResults}`;
    if (prefix && prefix.trim() !== '') {
      url += `&prefix=${encodeURIComponent(prefix.trim())}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MediaListResponse>(response);
  },

  /**
   * Fetch object metadata.
   */
  async getMetadata(objectName: string): Promise<MediaObject> {
    const response = await fetch(`${MEDIA_API_BASE_URL}/media/metadata/${encodeURIComponent(objectName)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MediaObject>(response);
  },

  /**
   * Delete a media object from GCS bucket.
   */
  async deleteMedia(objectName: string): Promise<{ message: string; bucket: string }> {
    const response = await fetch(`${MEDIA_API_BASE_URL}/media/${encodeURIComponent(objectName)}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<{ message: string; bucket: string }>(response);
  },

  /**
   * Generate a GCS Signed URL for direct access/download.
   */
  async createSignedUrl(objectName: string, method: string = 'GET', expirationMinutes: number = 15): Promise<SignedUrlResponse> {
    const response = await fetch(`${MEDIA_API_BASE_URL}/media/signed-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        object_name: objectName,
        method: method,
        expiration_minutes: expirationMinutes,
      }),
    });
    return handleResponse<SignedUrlResponse>(response);
  },

  /**
   * Get direct streaming read URL for media content display.
   */
  getReadUrl(objectName: string): string {
    return `${MEDIA_API_BASE_URL}/media/read/${objectName}`;
  }
};

/**
 * Resolves direct private GCS object URLs (https://storage.googleapis.com/sb-media-01/... or gs://sb-media-01/...)
 * to authenticated media streaming proxy URLs (http://localhost:8003/media/read/...) for browser rendering.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  const mediaBase = import.meta.env.VITE_API_URL_MEDIA || 'http://localhost:8003';
  const gcsPrefix = 'https://storage.googleapis.com/sb-media-01/';
  const gsPrefix = 'gs://sb-media-01/';

  if (url.startsWith(gcsPrefix)) {
    const objectPath = url.substring(gcsPrefix.length);
    return `${mediaBase}/media/read/${objectPath}`;
  }
  if (url.startsWith(gsPrefix)) {
    const objectPath = url.substring(gsPrefix.length);
    return `${mediaBase}/media/read/${objectPath}`;
  }
  return url;
}




