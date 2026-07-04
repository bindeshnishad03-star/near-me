'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export interface LocationFilter {
  country: string;
  state: string;
  city: string;
  district?: string;
  area?: string;
  society?: string;
  apartment?: string;
  latitude?: number;
  longitude?: number;
  radiusKm: number; // radius in km (0 means exact matches only)
  useGps: boolean;
}

interface LocationContextProps {
  location: LocationFilter;
  updateLocation: (newLoc: Partial<LocationFilter>) => void;
  resetToProfile: () => void;
  loading: boolean;
}

const defaultLocation: LocationFilter = {
  country: 'India',
  state: 'Karnataka',
  city: 'Bengaluru',
  district: 'Urban Bangalore',
  area: 'Indiranagar',
  radiusKm: 10,
  useGps: false,
};

const LocationContext = createContext<LocationContextProps>({
  location: defaultLocation,
  updateLocation: () => {},
  resetToProfile: () => {},
  loading: true,
});

export const useLocation = () => useContext(LocationContext);

export default function LocationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [location, setLocation] = useState<LocationFilter>(defaultLocation);
  const [loading, setLoading] = useState(true);

  // Fetch the user's location coordinates/preferences from the backend profile on load
  const fetchProfileLocation = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/profile`);
      if (res.ok) {
        const data = await res.json();
        if (data?.profile) {
          const prof = data.profile;
          setLocation({
            country: prof.country || 'India',
            state: prof.state || 'Karnataka',
            city: prof.city || 'Bengaluru',
            district: prof.district || '',
            area: prof.area || '',
            society: prof.society || '',
            apartment: prof.apartment || '',
            latitude: prof.latitude || undefined,
            longitude: prof.longitude || undefined,
            radiusKm: 10,
            useGps: prof.latitude && prof.longitude ? true : false,
          });
        }
      }
    } catch (e) {
      console.error('Failed to load profile location:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileLocation();
  }, [session?.user?.id]);

  const updateLocation = (newLoc: Partial<LocationFilter>) => {
    setLocation((prev) => ({ ...prev, ...newLoc }));
  };

  const resetToProfile = () => {
    fetchProfileLocation();
  };

  return (
    <LocationContext.Provider value={{ location, updateLocation, resetToProfile, loading }}>
      {children}
    </LocationContext.Provider>

    );


   }
