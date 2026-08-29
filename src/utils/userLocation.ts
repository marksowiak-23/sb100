/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserLocation {
  city?: string;
  state?: string;
  country?: string;
  label: string; // e.g. "Chicago, IL" or "Austin, TX"
  source: 'gps' | 'ip' | 'manual';
  latitude?: number;
  longitude?: number;
}

const STORAGE_KEY = 'sb_user_proximity_loc';

/**
 * Retrieves the cached user location from session storage if available.
 */
export function getCachedUserLocation(): UserLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

/**
 * Reverse geocodes latitude/longitude coordinates to a city/state label
 * using OpenStreetMap Nominatim.
 */
async function reverseGeocodeCoords(lat: number, lon: number): Promise<UserLocation | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'StoryBookApp/1.0'
        }
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const address = data?.address || {};

    const city = address.city || address.town || address.village || address.municipality || address.county || '';
    const state = address.state_code || address.state || '';
    const country = address.country_code ? address.country_code.toUpperCase() : address.country || '';

    const parts = [city, state].filter(Boolean);
    const label = parts.length > 0 ? parts.join(', ') : country || 'Nearby';

    return {
      city,
      state,
      country,
      label,
      source: 'gps',
      latitude: lat,
      longitude: lon
    };
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
    return null;
  }
}

/**
 * IP-based location fallback if GPS is not permitted or times out.
 */
async function detectLocationByIP(): Promise<UserLocation | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (data.city && (data.region_code || data.region)) {
      const city = data.city;
      const state = data.region_code || data.region;
      const country = data.country_code || data.country_name || '';
      return {
        city,
        state,
        country,
        label: `${city}, ${state}`,
        source: 'ip',
        latitude: data.latitude,
        longitude: data.longitude
      };
    }
  } catch {
    // Fallback to secondary IP endpoint if ipapi is unreachable
    try {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 3000);
      const res2 = await fetch('https://ipwho.is/', {
        signal: controller2.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId2);
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2.success && data2.city) {
          const city = data2.city;
          const state = data2.region_code || data2.region;
          const country = data2.country_code || '';
          return {
            city,
            state,
            country,
            label: state ? `${city}, ${state}` : city,
            source: 'ip',
            latitude: data2.latitude,
            longitude: data2.longitude
          };
        }
      }
    } catch {
      // Ignore fallback error
    }
  }
  return null;
}

/**
 * Detects the user's location via HTML5 Geolocation, falling back to IP geolocation.
 */
export async function detectUserLocation(forceRefresh = false): Promise<UserLocation | null> {
  if (typeof window === 'undefined') return null;

  if (!forceRefresh) {
    const cached = getCachedUserLocation();
    if (cached) return cached;
  }

  // 1. Try Browser HTML5 Geolocation
  if ('geolocation' in navigator) {
    try {
      const coords = await new Promise<GeolocationCoordinates | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          () => resolve(null),
          { timeout: 4000, maximumAge: 300000, enableHighAccuracy: false }
        );
      });

      if (coords) {
        const geoResult = await reverseGeocodeCoords(coords.latitude, coords.longitude);
        if (geoResult) {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(geoResult));
          window.dispatchEvent(new CustomEvent('user_location:detected', { detail: geoResult }));
          return geoResult;
        }
      }
    } catch {
      // Continue to IP fallback
    }
  }

  // 2. Try IP-based location detection
  const ipResult = await detectLocationByIP();
  if (ipResult) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ipResult));
    window.dispatchEvent(new CustomEvent('user_location:detected', { detail: ipResult }));
    return ipResult;
  }

  return null;
}

/**
 * Clear cached user location.
 */
export function clearUserLocation(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('user_location:detected', { detail: null }));
}
