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
  password_hash?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Mbr {
  mbrId: string;
  mbrFirstName: string;
  mbrLastName: string;
  mbrMiddleName?: string;
  mbrBirthDate?: string;
  mbrDeathDate?: string;
  mbrGenderCd?: string;
  mbrRelationshipStatusCd?: string;
  mbrLivesCityState?: string;
  mbrFromCityState?: string;
  mbrWorkAt?: string;
  mbrStudiedAt?: string;
  mbrEmailAddress?: string;
  mbrIntroduction?: string;
  mbrProfilePic?: string;
  mbrLat?: number;
  mbrLng?: number;
  mbrLocationCanonical?: string;
  mbrRegistrationDt?: string;
  mbrLastLoginDate?: string;
  mbrPriorLoginDate?: string;
  mbrCreatedAt?: string;
  mbrUpdatedAt?: string;
  user_id?: string;
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
  mbrStoryPublishedDate?: string;
  mbrStoryCreatedAt: string;
  mbrStoryUpdatedAt: string;
  mbrStoryThreadID?: string;
  mbrStorySubordinateId?: string;
  mbrMbrId: string;
  mbrId?: string;
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

export interface Topic {
  topicId: string;
  topicName: string;
  topicFullName?: string;
  topicSortOrder?: number | null;
  topicCreatedAt?: string;
  topicUpdatedAt?: string;
}

export interface GroupGlobal {
  grpId: string;
  grpName: string;
  grpDescription?: string;
  grpSortOrder?: number | null;
  grpCreatedAt?: string;
  grpUpdatedAt?: string;
}

export interface GroupCustom {
  grpId: string;
  mbrId: string;
  grpName: string;
  grpSortOrder?: number | null;
  grpCreatedAt?: string;
  grpUpdatedAt?: string;
}

export interface MbrTopicGroupPrivs {
  privId: string;
  mbrId: string;
  topicId: string;
  grpId: string;
  privValueCd: string;
  privCreatedAt?: string;
  privUpdatedAt?: string;
}

export interface MbrConnection {
  mbrConnectionId: string;
  mbrId: string;
  mbrConnectionMbrId: string;
  mbrConnectionCreatedAt?: string;
  mbrConnectionUpdatedAt?: string;
}

export interface MbrConnectionGrp {
  mbrConnectionGrpId: string;
  mbrConnectionId: string;
  grpId: string;
  mbrConnectionGrpCreatedAt?: string;
  mbrConnectionGrpUpdatedAt?: string;
}

export interface Cd {
  cdId: string;
  cdTag: string;
  cdValue: string;
  cdLabel?: string | null;
  cdSortOrder?: number | null;
  cdDesc?: string | null;
  cdCreatedAt?: string;
  cdUpdatedAt?: string;
}

export interface EventRecord {
  eventId: string;
  eventSiteCd?: string;
  eventActorId?: string;
  eventActorTypeCd?: string;
  eventCd?: string;
  eventDetail?: string;
  eventTagValue?: Record<string, any> | any;
  eventCreatedAt?: string;
  eventUpdatedAt?: string;
}

export interface EventCreate {
  eventSiteCd?: string;
  eventActorId?: string;
  eventActorTypeCd?: string;
  eventCd?: string;
  eventDetail?: string;
  eventTagValue?: Record<string, any>;
}

export type LookupCode = Cd | {
  cdId?: string;
  cdTag: string;
  cdValue: string;
  cdLabel?: string | null;
  cdDescription?: string | null;
  [key: string]: any;
};

export interface MbrContact {
  mbrContactId: string;
  mbrId: string;
  mbrContactEmail?: string;
  mbrContactMsg?: string;
  mbrContactReasonCd?: string;
  mbrContactResponseInd?: number;
  mbrContactResponseDt?: string;
  mbrContactMbrId?: string;
  grpId?: string;
  mbrContactCreatedAt?: string;
  mbrContactUpdatedAt?: string;
}

export interface MbrStoryActivity {
  actId: string;
  mbrId: string;
  mbrStoryId: string;
  actTypeCd: string;
  actMbrId?: string | null;
  actDate?: string | null;
  actCreatedAt?: string;
  actUpdatedAt?: string;
}

export interface MbrStat {
  statId: string;
  mbrId: string;
  statLastPublishedDt?: string | null;
  statStoriesPublishedCnt: number;
  statStoriesViewedCnt: number;
  statFamilyStoryCnt?: number;
  statResidenceCnt?: number;
  statActivityCnt?: number;
  statAchievementsCnt?: number;
  statEducationCnt?: number;
  statEmploymentCnt?: number;
  statCreatedAt?: string;
  statUpdatedAt?: string;
}

export interface MbrStoryStat {
  mbrStoryStatId: string;
  mbrId: string;
  mbrStoryId: string;
  mbrStoryStatViewedCnt: number;
  mbrStoryStatCommentCnt: number;
  mbrStoryStatLikedCnt: number;
  mbrStoryStatCreatedAt?: string;
  mbrStoryStatUpdatedAt?: string;
}

export interface MbrAiUsageLog {
  mbrAiUsageLogId: string;
  mbrId: string;
  userId?: string | null;
  sessionId: string;
  sessionDate: string;
  requestCount: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  totalLatencyMs: number;
  successCount: number;
  errorCount: number;
  lastLatencyMs?: number | null;
  lastModelName?: string | null;
  lastStatusCode?: number | null;
  lastErrorMessage?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadataJson?: any;
  createdAt: string;
  lastUsedAt: string;
}

export interface MbrSettings {

  mbrSettingsId: string;
  mbrId: string;
  mbrSettingsAllowPublicFlag: boolean;
  mbrSettingsShowBirthYr: boolean;
  mbrSettingsShowGender: boolean;
  mbrSettingsShowRelationship: boolean;
  mbrSettingsShowTown: boolean;
  mbrSettingsShowWorksAt: boolean;
  mbrSettingsShowStudiedAt: boolean;
  mbrSettingsShowIntroduction: boolean;
  mbrSettingsShowPhotoGallery: boolean;
  mbrSettingsCreatedAt?: string;
  mbrSettingsUpdatedAt?: string;
}



export interface SignedUrlResponse {
  bucket: string;
  object_name: string;
  signed_url: string;
  method: string;
  expiration_minutes: number;
}




/**
 * Resolves the service base URL. If running in a browser accessed via a LAN IP or hostname
 * (e.g. from a mobile phone or another device on the network), and the configured URL targets
 * localhost or 127.0.0.1, this automatically swaps 'localhost' for the current window.location.hostname
 * so all devices on the local network can access backend services seamlessly.
 */
export function getServiceBaseUrl(port: number, envUrl?: string): string {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const isLocalAccess = hostname === 'localhost' || hostname === '127.0.0.1';

    if (!isLocalAccess && hostname) {
      // If envUrl is explicitly provided and points to a remote domain (not localhost/127.0.0.1), respect it
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl;
      }
      const protocol = window.location.protocol || 'http:';
      return `${protocol}//${hostname}:${port}`;
    }
  }
  return envUrl || `http://localhost:${port}`;
}

export const API_BASE_URL = getServiceBaseUrl(8000, import.meta.env.VITE_API_URL);

export function getAuthHeaders(existingHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...existingHeaders };
  try {
    const token = sessionStorage.getItem('sb_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  return headers;
}

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
   * Fetch a member profile by member ID (mbrId).
   */
  async getMemberById(mbrId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/mbrs/${mbrId}?t=${Date.now()}`, {
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
   * Fetch members list with optional query, name, location filters, proximity, and limit/skip.
   */
  async getMembers(params?: {
    query?: string;
    name?: string;
    location?: string;
    proximity?: string;
    proximity_lat?: number;
    proximity_lng?: number;
    public_only?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<any[]> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.name) searchParams.append('name', params.name);
    if (params?.location) searchParams.append('location', params.location);
    if (params?.proximity) searchParams.append('proximity', params.proximity);
    if (params?.proximity_lat !== undefined && params?.proximity_lat !== null) searchParams.append('proximity_lat', params.proximity_lat.toString());
    if (params?.proximity_lng !== undefined && params?.proximity_lng !== null) searchParams.append('proximity_lng', params.proximity_lng.toString());
    if (params?.public_only !== undefined) searchParams.append('public_only', params.public_only.toString());
    if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString());
    searchParams.append('t', Date.now().toString());

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/mbrs${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
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
   * Fetch all stories, optionally filtered by a specific member ID.
   */
  async getStories(mbrId?: string, limit: number = 200, skip: number = 0): Promise<MbrStory[]> {
    const url = mbrId
      ? `${API_BASE_URL}/mbr-stories/member/${mbrId}?t=${Date.now()}`
      : `${API_BASE_URL}/mbr-stories?skip=${skip}&limit=${limit}&t=${Date.now()}`;
    const response = await fetch(url, {
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
   * Fetch a single story by ID, with optional viewer tracking.
   */
  async getStoryById(mbrStoryId: string, viewerMbrId?: string): Promise<MbrStory> {
    const url = viewerMbrId
      ? `${API_BASE_URL}/mbr-stories/${mbrStoryId}?viewer_mbr_id=${encodeURIComponent(viewerMbrId)}&t=${Date.now()}`
      : `${API_BASE_URL}/mbr-stories/${mbrStoryId}?t=${Date.now()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache'
    });
    return handleResponse<MbrStory>(response);
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
    if (!mbrId) return [];
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mbrId);
    if (!isUuid) return [];
    try {
      const response = await fetch(`${API_BASE_URL}/mbr-media/member/${mbrId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      if (response.status === 404) {
        return [];
      }
      return await handleResponse<MbrMedia[]>(response);
    } catch (e) {
      console.warn(`Could not fetch media for member ${mbrId}:`, e);
      return [];
    }
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
  },

  /**
   * Fetch code lookup records from the cd table, optionally filtered by cdTag.
   */
  async getCds(tag?: string, limit: number = 200, skip: number = 0): Promise<Cd[]> {
    let url = `${API_BASE_URL}/cds?skip=${skip}&limit=${limit}`;
    if (tag && tag.trim() !== '') {
      url += `&tag=${encodeURIComponent(tag.trim())}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<Cd[]>(response);
  },

  /**
   * Fetch a single code record by cdId.
   */
  async getCdById(cdId: string): Promise<Cd> {
    const response = await fetch(`${API_BASE_URL}/cds/${cdId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<Cd>(response);
  },

  /**
   * Create a new code record.
   */
  async createCd(cd: Partial<Cd>): Promise<Cd> {
    const response = await fetch(`${API_BASE_URL}/cds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(cd),
    });
    return handleResponse<Cd>(response);
  },

  /**
   * Update an existing code record.
   */
  async updateCd(cdId: string, cd: Partial<Cd>): Promise<Cd> {
    const response = await fetch(`${API_BASE_URL}/cds/${cdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(cd),
    });
    return handleResponse<Cd>(response);
  },

  /**
   * Delete a code record.
   */
  async deleteCd(cdId: string): Promise<Cd> {
    const response = await fetch(`${API_BASE_URL}/cds/${cdId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<Cd>(response);
  },

  /**
   * Fetch all topics.
   */
  async getTopics(query?: string, limit: number = 100, skip: number = 0): Promise<Topic[]> {
    let url = `${API_BASE_URL}/topics?skip=${skip}&limit=${limit}&t=${Date.now()}`;
    if (query && query.trim() !== '') {
      url += `&query=${encodeURIComponent(query.trim())}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache'
    });
    return handleResponse<Topic[]>(response);
  },

  /**
   * Fetch all global groups.
   */
  async getGroupsGlobal(query?: string, limit: number = 100, skip: number = 0): Promise<GroupGlobal[]> {
    let url = `${API_BASE_URL}/groupGlobals?skip=${skip}&limit=${limit}&t=${Date.now()}`;
    if (query && query.trim() !== '') {
      url += `&query=${encodeURIComponent(query.trim())}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache'
    });
    return handleResponse<GroupGlobal[]>(response);
  },

  /**
   * Alias for getGroupsGlobal.
   */
  async getGlobalGroups(query?: string, limit: number = 100, skip: number = 0): Promise<GroupGlobal[]> {
    return this.getGroupsGlobal(query, limit, skip);
  },

  /**
   * Fetch custom groups for a specific member.
   */
  async getGroupsCustom(mbrId: string, query?: string, limit: number = 100, skip: number = 0): Promise<GroupCustom[]> {
    let url = `${API_BASE_URL}/groupCustoms?mbr_id=${encodeURIComponent(mbrId)}&skip=${skip}&limit=${limit}&t=${Date.now()}`;
    if (query && query.trim() !== '') {
      url += `&query=${encodeURIComponent(query.trim())}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache'
    });
    return handleResponse<GroupCustom[]>(response);
  },

  /**
   * Alias for getGroupsCustom.
   */
  async getMemberCustomGroups(mbrId: string, query?: string, limit: number = 100, skip: number = 0): Promise<GroupCustom[]> {
    return this.getGroupsCustom(mbrId, query, limit, skip);
  },

  /**
   * Fetch member topic group privilege records.
   */
  async getMemberTopicGroupPrivs(params?: { mbrId?: string; topicId?: string; grpId?: string; limit?: number; skip?: number }): Promise<MbrTopicGroupPrivs[]> {
    const searchParams = new URLSearchParams();
    if (params?.mbrId) searchParams.append('mbr_id', params.mbrId);
    if (params?.topicId) searchParams.append('topic_id', params.topicId);
    if (params?.grpId) searchParams.append('grp_id', params.grpId);
    if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString());
    searchParams.append('t', Date.now().toString());

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/mbr-topic-group-privs${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache'
    });
    return handleResponse<MbrTopicGroupPrivs[]>(response);
  },

  /**
   * Create a single member topic group privilege record.
   */
  async createMemberTopicGroupPriv(priv: Partial<MbrTopicGroupPrivs>): Promise<MbrTopicGroupPrivs> {
    const response = await fetch(`${API_BASE_URL}/mbr-topic-group-privs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(priv),
    });
    return handleResponse<MbrTopicGroupPrivs>(response);
  },

  /**
   * Update a member topic group privilege record.
   */
  async updateMemberTopicGroupPriv(privId: string, priv: Partial<MbrTopicGroupPrivs>): Promise<MbrTopicGroupPrivs> {
    const response = await fetch(`${API_BASE_URL}/mbr-topic-group-privs/${privId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(priv),
    });
    return handleResponse<MbrTopicGroupPrivs>(response);
  },

  /**
   * Delete a member topic group privilege record.
   */
  async deleteMemberTopicGroupPriv(privId: string): Promise<MbrTopicGroupPrivs> {
    const response = await fetch(`${API_BASE_URL}/mbr-topic-group-privs/${privId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MbrTopicGroupPrivs>(response);
  },

  /**
   * Fetch member connections with optional filtering.
   */
  async getMemberConnections(params?: { mbrId?: string; connectedMbrId?: string; skip?: number; limit?: number }): Promise<MbrConnection[]> {
    const query = new URLSearchParams();
    if (params?.mbrId) query.append('mbr_id', params.mbrId);
    if (params?.connectedMbrId) query.append('connected_mbr_id', params.connectedMbrId);
    if (params?.skip !== undefined) query.append('skip', params.skip.toString());
    if (params?.limit !== undefined) query.append('limit', params.limit.toString());
    query.append('t', Date.now().toString());

    const url = `${API_BASE_URL}/mbr-connections${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache'
    });
    return handleResponse<MbrConnection[]>(response);
  },

  /**
   * Create a new member connection.
   */
  async createMemberConnection(conn: Partial<MbrConnection>): Promise<MbrConnection> {
    const response = await fetch(`${API_BASE_URL}/mbr-connections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(conn),
    });
    return handleResponse<MbrConnection>(response);
  },

  /**
   * Update a member connection.
   */
  async updateMemberConnection(connectionId: string, conn: Partial<MbrConnection>): Promise<MbrConnection> {
    const response = await fetch(`${API_BASE_URL}/mbr-connections/${connectionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(conn),
    });
    return handleResponse<MbrConnection>(response);
  },

  /**
   * Delete a member connection.
   */
  async deleteMemberConnection(connectionId: string): Promise<MbrConnection> {
    const response = await fetch(`${API_BASE_URL}/mbr-connections/${connectionId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MbrConnection>(response);
  },

  /**
   * Fetch member connection group associations.
   */
  async getMemberConnectionGrps(params?: { connectionId?: string; grpId?: string; skip?: number; limit?: number }): Promise<MbrConnectionGrp[]> {
    const query = new URLSearchParams();
    if (params?.connectionId) query.append('connection_id', params.connectionId);
    if (params?.grpId) query.append('grp_id', params.grpId);
    if (params?.skip !== undefined) query.append('skip', params.skip.toString());
    if (params?.limit !== undefined) query.append('limit', params.limit.toString());
    query.append('t', Date.now().toString());

    const url = `${API_BASE_URL}/mbr-connection-grps${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-cache'
    });
    return handleResponse<MbrConnectionGrp[]>(response);
  },

  /**
   * Create a member connection group assignment.
   */
  async createMemberConnectionGrp(connGrp: Partial<MbrConnectionGrp>): Promise<MbrConnectionGrp> {
    const response = await fetch(`${API_BASE_URL}/mbr-connection-grps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(connGrp),
    });
    return handleResponse<MbrConnectionGrp>(response);
  },

  /**
   * Update a member connection group assignment.
   */
  async updateMemberConnectionGrp(connectionGrpId: string, connGrp: Partial<MbrConnectionGrp>): Promise<MbrConnectionGrp> {
    const response = await fetch(`${API_BASE_URL}/mbr-connection-grps/${connectionGrpId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(connGrp),
    });
    return handleResponse<MbrConnectionGrp>(response);
  },

  /**
   * Delete a member connection group assignment.
   */
  async deleteMemberConnectionGrp(connectionGrpId: string): Promise<MbrConnectionGrp> {
    const response = await fetch(`${API_BASE_URL}/mbr-connection-grps/${connectionGrpId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MbrConnectionGrp>(response);
  },

  /**
   * Fetch member contact records for a given member ID.
   */
  async getMemberContacts(mbrId: string): Promise<MbrContact[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-contacts/member/${mbrId}?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    return handleResponse<MbrContact[]>(response);
  },

  /**
   * Fetch member contact records where contactMbrId is the recipient member.
   */
  async getMemberContactsByRecipient(contactMbrId: string): Promise<MbrContact[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-contacts?contact_mbr_id=${contactMbrId}&limit=100&t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    return handleResponse<MbrContact[]>(response);
  },

  /**
   * Fetch all member contact records.
   */
  async getAllMemberContacts(): Promise<MbrContact[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-contacts?limit=200&t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    return handleResponse<MbrContact[]>(response);
  },

  /**
   * Create a member contact inquiry record.
   */
  async createMemberContact(contact: Partial<MbrContact>): Promise<MbrContact> {
    const response = await fetch(`${API_BASE_URL}/mbr-contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(contact)
    });
    return handleResponse<MbrContact>(response);
  },

  /**
   * Update a member contact record.
   */
  async updateMemberContact(contactId: string, contact: Partial<MbrContact>): Promise<MbrContact> {
    const response = await fetch(`${API_BASE_URL}/mbr-contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(contact)
    });
    return handleResponse<MbrContact>(response);
  },

  /**
   * Delete a member contact record.
   */
  async deleteMemberContact(contactId: string): Promise<MbrContact> {
    const response = await fetch(`${API_BASE_URL}/mbr-contacts/${contactId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse<MbrContact>(response);
  }
};

export const mbrStoryActivityApi = {
  /**
   * Get all story activities with pagination.
   */
  async getStoryActivities(skip: number = 0, limit: number = 100): Promise<MbrStoryActivity[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-story-activities?skip=${skip}&limit=${limit}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse<MbrStoryActivity[]>(response);
  },

  /**
   * Get a single story activity by ID.
   */
  async getStoryActivity(actId: string): Promise<MbrStoryActivity> {
    const response = await fetch(`${API_BASE_URL}/mbr-story-activities/${actId}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse<MbrStoryActivity>(response);
  },

  /**
   * Get story activities for a specific story ID.
   */
  async getStoryActivitiesByStoryId(mbrStoryId: string): Promise<MbrStoryActivity[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-story-activities/story/${mbrStoryId}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse<MbrStoryActivity[]>(response);
  },

  /**
   * Get story activities for a specific member ID.
   */
  async getStoryActivitiesByMbrId(mbrId: string): Promise<MbrStoryActivity[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-story-activities/member/${mbrId}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse<MbrStoryActivity[]>(response);
  },

  /**
   * Create a new story activity record.
   */
  async createStoryActivity(activity: Partial<MbrStoryActivity>): Promise<MbrStoryActivity> {
    const response = await fetch(`${API_BASE_URL}/mbr-story-activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(activity)
    });
    return handleResponse<MbrStoryActivity>(response);
  },

  /**
   * Update a story activity record.
   */
  async updateStoryActivity(actId: string, activity: Partial<MbrStoryActivity>): Promise<MbrStoryActivity> {
    const response = await fetch(`${API_BASE_URL}/mbr-story-activities/${actId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(activity)
    });
    return handleResponse<MbrStoryActivity>(response);
  },

  /**
   * Delete a story activity record.
   */
  async deleteStoryActivity(actId: string): Promise<MbrStoryActivity> {
    const response = await fetch(`${API_BASE_URL}/mbr-story-activities/${actId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse<MbrStoryActivity>(response);
  }
};

export const mbrStatApi = {
  /**
   * Get all member stats with pagination.
   */
  async getMemberStats(skip: number = 0, limit: number = 100): Promise<MbrStat[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-stats?skip=${skip}&limit=${limit}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse<MbrStat[]>(response);
  },

  /**
   * Get a single member stat record by stat ID.
   */
  async getMemberStat(statId: string): Promise<MbrStat> {
    const response = await fetch(`${API_BASE_URL}/mbr-stats/${statId}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse<MbrStat>(response);
  },

  /**
   * Get a member stat record by member ID.
   */
  async getMemberStatByMbrId(mbrId: string): Promise<MbrStat> {
    const response = await fetch(`${API_BASE_URL}/mbr-stats/member/${mbrId}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse<MbrStat>(response);
  },

  /**
   * Create a new member stat record.
   */
  async createMemberStat(stat: Partial<MbrStat>): Promise<MbrStat> {
    const response = await fetch(`${API_BASE_URL}/mbr-stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(stat)
    });
    return handleResponse<MbrStat>(response);
  },

  /**
   * Update a member stat record.
   */
  async updateMemberStat(statId: string, stat: Partial<MbrStat>): Promise<MbrStat> {
    const response = await fetch(`${API_BASE_URL}/mbr-stats/${statId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(stat)
    });
    return handleResponse<MbrStat>(response);
  },

  /**
   * Delete a member stat record.
   */
  async deleteMemberStat(statId: string): Promise<MbrStat> {
    const response = await fetch(`${API_BASE_URL}/mbr-stats/${statId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse<MbrStat>(response);
  }
};

export const mbrStoryStatApi = {
  /**
   * Get all member story stats with pagination.
   */
  async getMemberStoryStats(skip: number = 0, limit: number = 100): Promise<MbrStoryStat[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-story-stats?skip=${skip}&limit=${limit}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse<MbrStoryStat[]>(response);
  },

  /**
   * Get a single member story stat record by stat ID.
   */
  async getMemberStoryStat(storyStatId: string): Promise<MbrStoryStat> {
    const response = await fetch(`${API_BASE_URL}/mbr-story-stats/${storyStatId}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse<MbrStoryStat>(response);
  },

  /**
   * Get a member story stat record by story ID.
   */
  async getMemberStoryStatByStoryId(mbrStoryId: string): Promise<MbrStoryStat> {
    const response = await fetch(`${API_BASE_URL}/mbr-story-stats/story/${mbrStoryId}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse<MbrStoryStat>(response);
  },

  /**
   * Get member story stat records by member ID.
   */
  async getMemberStoryStatsByMbrId(mbrId: string): Promise<MbrStoryStat[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-story-stats/member/${mbrId}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse<MbrStoryStat[]>(response);
  },


  /**
   * Create a new member story stat record.
   */
  async createMemberStoryStat(stat: Partial<MbrStoryStat>): Promise<MbrStoryStat> {
    const response = await fetch(`${API_BASE_URL}/mbr-story-stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(stat)
    });
    return handleResponse<MbrStoryStat>(response);
  },

  /**
   * Update a member story stat record.
   */
  async updateMemberStoryStat(storyStatId: string, stat: Partial<MbrStoryStat>): Promise<MbrStoryStat> {
    const response = await fetch(`${API_BASE_URL}/mbr-story-stats/${storyStatId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(stat)
    });
    return handleResponse<MbrStoryStat>(response);
  },

  /**
   * Delete a member story stat record.
   */
  async deleteMemberStoryStat(storyStatId: string): Promise<MbrStoryStat> {
    const response = await fetch(`${API_BASE_URL}/mbr-story-stats/${storyStatId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse<MbrStoryStat>(response);
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
  }
};

export interface ChatResponse {
  response: string;
  thread_id: string;
  tokens_used?: number;
}

export const AI_API_BASE_URL = getServiceBaseUrl(8002, import.meta.env.VITE_API_URL_AI);

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

export const MEDIA_API_BASE_URL = getServiceBaseUrl(8003, import.meta.env.VITE_API_URL_MEDIA);

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
   * List all objects in the GCS media bucket with optional prefix filtering.
   */
  async listMedia(prefix?: string, maxResults?: number): Promise<MediaListResponse> {
    const url = new URL(`${MEDIA_API_BASE_URL}/media/list`);
    if (prefix) {
      url.searchParams.append('prefix', prefix);
    }
    if (maxResults) {
      url.searchParams.append('max_results', maxResults.toString());
    }
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MediaListResponse>(response);
  },

  /**
   * Deletes an object from Google Cloud Storage.
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
   * Uploads a raw binary file to GCS with optional custom object name.
   */
  async uploadMedia(file: File | Blob, destinationName?: string, contentType?: string): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (destinationName) {
      formData.append('destination_name', destinationName);
    }
    if (contentType) {
      formData.append('content_type', contentType);
    }

    const response = await fetch(`${MEDIA_API_BASE_URL}/media/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<MediaUploadResponse>(response);
  },

  /**
   * Generates a pre-signed PUT or GET URL for direct, secure uploads/downloads.
   */
  async getSignedUrl(objectName: string, method: 'GET' | 'PUT' = 'GET', expirationMinutes: number = 15): Promise<SignedUrlResponse> {
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
   * Alias for getSignedUrl.
   */
  async createSignedUrl(objectName: string, method: 'GET' | 'PUT' = 'GET', expirationMinutes: number = 15): Promise<SignedUrlResponse> {
    return this.getSignedUrl(objectName, method, expirationMinutes);
  },

  /**
   * Convenience reader method: constructs the direct streaming media proxy URL.
   */
  getReadUrl(objectName: string): string {
    return `${MEDIA_API_BASE_URL}/media/read/${objectName}`;
  }
};

/**
 * Resolves direct private GCS object URLs (https://storage.googleapis.com/sb-media-01/... or gs://sb-media-01/...)
 * to authenticated media streaming proxy URLs (http://<host>:8003/media/read/...) for browser rendering.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  const mediaBase = MEDIA_API_BASE_URL;
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

  // Rewrite hardcoded localhost/127.0.0.1 media URLs if accessed over LAN IP
  if (typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    if (url.includes('localhost:8003') || url.includes('127.0.0.1:8003')) {
      return url.replace(/https?:\/\/(localhost|127\.0\.0\.1):8003/, mediaBase);
    }
    if (url.includes('localhost:8000') || url.includes('127.0.0.1:8000')) {
      return url.replace(/https?:\/\/(localhost|127\.0\.0\.1):8000/, API_BASE_URL);
    }
  }

  return url;
}

export interface SysConfig {
  configId: string;
  configTag: string;
  configValue: string;
  configType: 'STRING' | 'BOOLEAN' | 'NUMBER' | 'JSON' | string;
  configGroup: 'FEATURES' | 'LIMITS' | 'SYSTEM' | 'AUTHENTICATION' | 'UI' | string;
  configDesc?: string | null;
  configCreatedAt: string;
  configUpdatedAt: string;
  configUpdatedBy?: string | null;
}

export const sysConfigApi = {
  /**
   * Fetch all dynamic system configuration properties with optional group filter.
   */
  async getSysConfigs(group?: string): Promise<SysConfig[]> {
    const url = new URL(`${API_BASE_URL}/sys-configs`);
    if (group) url.searchParams.append('group', group);
    url.searchParams.append('t', Date.now().toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    return handleResponse<SysConfig[]>(response);
  },

  /**
   * Fetch a single system configuration property by tag.
   */
  async getSysConfigByTag(configTag: string): Promise<SysConfig> {
    const response = await fetch(`${API_BASE_URL}/sys-configs/${encodeURIComponent(configTag)}?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    return handleResponse<SysConfig>(response);
  },

  /**
   * Fetch active in-memory configuration cache snapshot.
   */
  async getSysConfigCache(): Promise<{ properties: Record<string, string>; metadata: Record<string, any> }> {
    const response = await fetch(`${API_BASE_URL}/sys-configs/cache?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    return handleResponse<{ properties: Record<string, string>; metadata: Record<string, any> }>(response);
  },

  /**
   * Create a new configuration tag.
   */
  async createSysConfig(config: Partial<SysConfig>): Promise<SysConfig> {
    const response = await fetch(`${API_BASE_URL}/sys-configs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(config),
    });
    const result = await handleResponse<SysConfig>(response);
    if (typeof window !== 'undefined' && result?.configTag) {
      window.dispatchEvent(new CustomEvent('sysconfig:changed', { detail: result }));
    }
    return result;
  },

  /**
   * Update an existing configuration tag's value or description.
   */
  async updateSysConfig(configTag: string, config: Partial<SysConfig>): Promise<SysConfig> {
    const response = await fetch(`${API_BASE_URL}/sys-configs/${encodeURIComponent(configTag)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(config),
    });
    const result = await handleResponse<SysConfig>(response);
    if (typeof window !== 'undefined' && result?.configTag) {
      window.dispatchEvent(new CustomEvent('sysconfig:changed', { detail: result }));
    }
    return result;
  },

  /**
   * Delete a configuration tag.
   */
  async deleteSysConfig(configTag: string): Promise<SysConfig> {
    const response = await fetch(`${API_BASE_URL}/sys-configs/${encodeURIComponent(configTag)}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    const result = await handleResponse<SysConfig>(response);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sysconfig:changed', { detail: { configTag, deleted: true } }));
    }
    return result;
  }
};

export const mbrSettingsApi = {
  /**
   * Fetch member settings by member ID.
   */
  async getMemberSettings(mbrId: string): Promise<MbrSettings> {
    const response = await fetch(`${API_BASE_URL}/mbr-settings/member/${mbrId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MbrSettings>(response);
  },

  /**
   * Fetch list of all member settings records.
   */
  async getSettingsList(skip = 0, limit = 100): Promise<MbrSettings[]> {
    const response = await fetch(`${API_BASE_URL}/mbr-settings?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MbrSettings[]>(response);
  },

  /**
   * Fetch a member settings record by settings ID.
   */
  async getSettingsById(mbrSettingsId: string): Promise<MbrSettings> {
    const response = await fetch(`${API_BASE_URL}/mbr-settings/${mbrSettingsId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MbrSettings>(response);
  },

  /**
   * Create new member settings.
   */
  async createMemberSettings(settings: Partial<MbrSettings>): Promise<MbrSettings> {
    const response = await fetch(`${API_BASE_URL}/mbr-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    return handleResponse<MbrSettings>(response);
  },

  /**
   * Update member settings.
   */
  async updateMemberSettings(mbrSettingsId: string, settings: Partial<MbrSettings>): Promise<MbrSettings> {
    const response = await fetch(`${API_BASE_URL}/mbr-settings/${mbrSettingsId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    return handleResponse<MbrSettings>(response);
  },

  /**
   * Delete member settings.
   */
  async deleteMemberSettings(mbrSettingsId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/mbr-settings/${mbrSettingsId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<{ message: string }>(response);
  }
};

export const mbrAiUsageLogApi = {
  /**
   * Record AI usage and atomically increment running totals for a session.
   */
  async recordUsage(payload: {
    mbrId: string;
    userId?: string | null;
    sessionId: string;
    sessionDate?: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
    latencyMs: number;
    modelName?: string;
    statusCode?: number;
    isSuccess?: boolean;
    errorMessage?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadataJson?: any;
  }): Promise<MbrAiUsageLog> {
    const response = await fetch(`${API_BASE_URL}/mbrAiUsageLogs/record-usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<MbrAiUsageLog>(response);
  },

  /**
   * Fetch list of AI usage logs.
   */
  async getUsageLogs(params?: { mbrId?: string; userId?: string; sessionId?: string; skip?: number; limit?: number }): Promise<MbrAiUsageLog[]> {
    const query = new URLSearchParams();
    if (params?.mbrId) query.set('mbrId', params.mbrId);
    if (params?.userId) query.set('userId', params.userId);
    if (params?.sessionId) query.set('sessionId', params.sessionId);
    if (params?.skip !== undefined) query.set('skip', params.skip.toString());
    if (params?.limit !== undefined) query.set('limit', params.limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/mbrAiUsageLogs?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MbrAiUsageLog[]>(response);
  },

  /**
   * Fetch single AI usage log by session ID.
   */
  async getUsageLogBySession(sessionId: string): Promise<MbrAiUsageLog> {
    const response = await fetch(`${API_BASE_URL}/mbrAiUsageLogs/session/${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MbrAiUsageLog>(response);
  }
};

export const eventApi = {
  /**
   * Log an event explicitly from the frontend client.
   */
  async logEvent(event: EventCreate): Promise<EventRecord> {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        eventSiteCd: event.eventSiteCd || 'SB',
        ...event,
      }),
    });
    return handleResponse<EventRecord>(response);
  },

  /**
   * Fetch logged events with optional filters.
   */
  async getEvents(params?: {
    skip?: number;
    limit?: number;
    eventCd?: string;
    eventActorId?: string;
    eventSiteCd?: string;
  }): Promise<EventRecord[]> {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.set('skip', params.skip.toString());
    if (params?.limit !== undefined) query.set('limit', params.limit.toString());
    if (params?.eventCd) query.set('eventCd', params.eventCd);
    if (params?.eventActorId) query.set('eventActorId', params.eventActorId);
    if (params?.eventSiteCd) query.set('eventSiteCd', params.eventSiteCd);

    const response = await fetch(`${API_BASE_URL}/events?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<EventRecord[]>(response);
  },

  /**
   * Fetch a single event by ID.
   */
  async getEvent(eventId: string): Promise<EventRecord> {
    const response = await fetch(`${API_BASE_URL}/events/${encodeURIComponent(eventId)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<EventRecord>(response);
  }
};

// ==========================================
// SESSION MANAGEMENT HELPER
// ==========================================
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'sess_default';
  let sid = sessionStorage.getItem('sb_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    sessionStorage.setItem('sb_session_id', sid);
  }
  return sid;
}

// ==========================================
// MBR PERSONAL TRIVIA & DID YOU KNOW API
// ==========================================
export const mbrPersonalTriviaApi = {
  /**
   * Fetch or generate today's daily personal trivia for a member.
   */
  async getDailyTrivia(mbrId: string): Promise<MbrPersonalTrivia> {
    const sessionId = getOrCreateSessionId();
    const response = await fetch(`${API_BASE_URL}/api/mbr/trivia/daily/${encodeURIComponent(mbrId)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-session-id': sessionId,
      },
    });
    return handleResponse<MbrPersonalTrivia>(response);
  },

  /**
   * Force generate a new trivia item for a member on demand.
   */
  async generateNewTrivia(mbrId: string, preferredTopic?: string): Promise<MbrPersonalTrivia> {
    const sessionId = getOrCreateSessionId();
    const response = await fetch(`${API_BASE_URL}/api/mbr/trivia/generate/${encodeURIComponent(mbrId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-session-id': sessionId,
      },
      body: JSON.stringify({
        mbrId,
        forceNew: true,
        preferredTopic: preferredTopic || null
      }),
    });
    return handleResponse<MbrPersonalTrivia>(response);
  },

  /**
   * Get trivia history for a member.
   */
  async getTriviaHistory(
    mbrId: string,
    params?: { isFavorite?: boolean; anchorTopic?: string; skip?: number; limit?: number }
  ): Promise<MbrPersonalTrivia[]> {
    const query = new URLSearchParams();
    if (params?.isFavorite !== undefined) query.set('is_favorite', params.isFavorite.toString());
    if (params?.anchorTopic) query.set('anchor_topic', params.anchorTopic);
    if (params?.skip !== undefined) query.set('skip', params.skip.toString());
    if (params?.limit !== undefined) query.set('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/mbr/trivia/history/${encodeURIComponent(mbrId)}?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MbrPersonalTrivia[]>(response);
  },

  /**
   * Toggle favorite bookmark on a trivia item.
   */
  async toggleTriviaFavorite(triviaId: string): Promise<MbrPersonalTrivia> {
    const response = await fetch(`${API_BASE_URL}/api/mbr/trivia/${encodeURIComponent(triviaId)}/favorite`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<MbrPersonalTrivia>(response);
  },

  /**
   * Delete a trivia article.
   */
  async deleteTrivia(triviaId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/mbr/trivia/${encodeURIComponent(triviaId)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to delete trivia with status ${response.status}`);
    }
  }
};

export interface MbrPersonalTrivia {
  mbrTriviaId: string;
  mbrId: string;
  anchorTopic: string;
  anchorReference?: string;
  headline: string;
  storyContent: string;
  promptSuggestion?: string;
  chWriterId?: string;
  isFavorite: boolean;
  viewedAt: string;
  createdAt: string;
}

// ==========================================
// MBR REMEMBER WHEN & NOSTALGIA API
// ==========================================
export interface MbrRememberWhenGenerateParams {
  birthYear?: number;
  lifeStage?: string;
  lifeStageLabel?: string;
  targetYear?: number;
  category?: string;
}

export interface MbrRememberWhenItem {
  id: string;
  year: number;
  decade: number;
  category: 'POP_CULTURE' | 'BIG_NEWS' | 'MOVIES_TV' | 'FADS_TRENDS' | 'COST_OF_LIVING';
  headline: string;
  storyContent: string;
  promptSuggestion: string;
  badge?: string;
}

export const mbrRememberWhenApi = {
  /**
   * Generate an AI-powered nostalgic memory and record token usage in mbrAiUsageLog.
   */
  async generateAiMemory(mbrId: string, params: MbrRememberWhenGenerateParams): Promise<MbrRememberWhenItem> {
    const sessionId = getOrCreateSessionId();
    const response = await fetch(`${API_BASE_URL}/api/mbr/remember-when/generate/${encodeURIComponent(mbrId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-session-id': sessionId,
      },
      body: JSON.stringify({
        birthYear: params.birthYear,
        lifeStage: params.lifeStage,
        lifeStageLabel: params.lifeStageLabel,
        targetYear: params.targetYear,
        category: params.category,
      }),
    });
    return handleResponse<MbrRememberWhenItem>(response);
  },
};







