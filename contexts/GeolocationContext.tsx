'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface GeolocationData {
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  detected: boolean;
}

interface GeolocationContextType {
  location: GeolocationData;
  requestLocation: () => void;
}

const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined);

export function GeolocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<GeolocationData>({ detected: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check if we already have location in localStorage
    const cached = localStorage.getItem('ryvynn-geolocation');
    if (cached) {
      try {
        setLocation(JSON.parse(cached));
      } catch {}
    }
    setMounted(true);
  }, []);

  const requestLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      const geoData: GeolocationData = {
        city: data.city,
        region: data.region,
        country: data.country_name,
        countryCode: data.country_code,
        detected: true,
      };
      
      setLocation(geoData);
      localStorage.setItem('ryvynn-geolocation', JSON.stringify(geoData));
    } catch (error) {
      console.error('Geolocation detection failed:', error);
      setLocation({ detected: false });
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <GeolocationContext.Provider value={{ location, requestLocation }}>
      {children}
    </GeolocationContext.Provider>
  );
}

export function useGeolocation() {
  const context = useContext(GeolocationContext);
  if (!context) {
    throw new Error('useGeolocation must be used within GeolocationProvider');
  }
  return context;
}
