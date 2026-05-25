'use client';

/**
 * useDeviceGeo
 * Client-side only. Device requests location from browser.
 * Server never receives coordinates. Used to give Guardian
 * location-aware crisis resources (country/region only).
 * Privacy: coords are never sent to our servers.
 */

import { useState, useEffect } from 'react';

export interface DeviceGeo {
  country: string | null;
  region: string | null;
  ready: boolean;
  denied: boolean;
}

const GEO_CACHE_KEY = 'ryvynn_geo_v1';
const GEO_CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours

function reverseGeocode(lat: number, lon: number): Promise<{ country: string; region: string }> {
  // Use nominatim — free, no API key, returns country/state only
  return fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=5&addressdetails=1`,
    { headers: { 'Accept-Language': 'en', 'User-Agent': 'RYVYNN-Crisis-Support/1.0' } }
  )
    .then(r => r.json())
    .then(d => ({
      country: d.address?.country_code?.toUpperCase() || 'US',
      region: d.address?.state || '',
    }))
    .catch(() => ({ country: 'US', region: '' }));
}

export function useDeviceGeo(): DeviceGeo {
  const [geo, setGeo] = useState<DeviceGeo>({ country: null, region: null, ready: false, denied: false });

  useEffect(() => {
    // Check cache first
    try {
      const cached = localStorage.getItem(GEO_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < GEO_CACHE_TTL) {
          setGeo({ ...data, ready: true, denied: false });
          return;
        }
      }
    } catch {}

    if (!navigator.geolocation) {
      setGeo({ country: 'US', region: '', ready: true, denied: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const result = await reverseGeocode(latitude, longitude);
        const data = { country: result.country, region: result.region };
        try {
          localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
        } catch {}
        setGeo({ ...data, ready: true, denied: false });
      },
      () => {
        // Denied or unavailable — default to US resources
        setGeo({ country: 'US', region: '', ready: true, denied: true });
      },
      { timeout: 5000, maximumAge: GEO_CACHE_TTL }
    );
  }, []);

  return geo;
}

/**
 * Get country-specific crisis resources.
 * Extend this list as RYVYNN expands globally.
 */
export function getCrisisResourcesByCountry(country: string | null): Array<{
  name: string;
  phone?: string;
  text?: string;
  url?: string;
  description: string;
}> {
  const c = (country || 'US').toUpperCase();

  const resources: Record<string, Array<{ name: string; phone?: string; text?: string; url?: string; description: string }>> = {
    US: [
      { name: '988 Suicide & Crisis Lifeline', phone: '988', text: '988', description: '24/7 free crisis support. Call or text.' },
      { name: 'Crisis Text Line', text: '741741', description: 'Text HOME to 741741. Free 24/7.' },
      { name: 'SAMHSA Helpline', phone: '1-800-662-4357', description: 'Mental health & substance use. Free 24/7.' },
    ],
    CA: [
      { name: 'Talk Suicide Canada', phone: '1-833-456-4566', text: '45645', description: '24/7 crisis support across Canada.' },
      { name: 'Crisis Services Canada', url: 'https://www.crisisservicescanada.ca', description: 'Find local crisis support.' },
    ],
    GB: [
      { name: 'Samaritans', phone: '116 123', description: 'Free 24/7 emotional support. Call anytime.' },
      { name: 'PAPYRUS (Youth)', phone: '0800 068 4141', description: 'Prevention of young suicide. Confidential.' },
    ],
    AU: [
      { name: 'Lifeline', phone: '13 11 14', text: '0477 13 11 14', description: '24/7 crisis support.' },
      { name: 'Beyond Blue', phone: '1300 22 4636', description: 'Mental health support. 24/7.' },
    ],
    NZ: [
      { name: 'Lifeline NZ', phone: '0800 543 354', description: '24/7 crisis helpline.' },
      { name: 'Need to Talk?', phone: '1737', description: 'Text or call 1737. Free 24/7.' },
    ],
    IE: [
      { name: 'Samaritans Ireland', phone: '116 123', description: 'Free 24/7 emotional support.' },
      { name: 'Pieta House', phone: '116 123', description: 'Suicide and self-harm crisis intervention.' },
    ],
    MX: [
      { name: 'SAPTEL', phone: '55 5259-8121', description: '24/7 crisis support Mexico City.' },
    ],
    IN: [
      { name: 'iCall', phone: '9152987821', description: 'Psychosocial helpline. Mon-Sat 8am-10pm.' },
      { name: 'Vandrevala Foundation', phone: '1860-2662-345', description: '24/7 mental health support.' },
    ],
    ZA: [
      { name: 'South African Depression & Anxiety Group', phone: '0800 456 789', description: '24/7 crisis counseling.' },
    ],
  };

  return resources[c] || resources['US'];
}
