import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CityContext = createContext({ selectedCity: '', setSelectedCity: () => {} });

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState('Ahmedabad');

  useEffect(() => {
    // Try to detect user's city via Geolocation + Nominatim reverse geocoding
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'GOMEL-CARS/1.0 (city detection)'
              },
            }
          );
          const data = await resp.json();
          const cityName =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.state_district ||
            data?.address?.state ||
            '';
          if (cityName) setSelectedCity(cityName);
        } catch (e) {
          // Silent fallback to default
        }
      },
      () => {
        // Permission denied or error -> keep default
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  const value = useMemo(() => ({ selectedCity, setSelectedCity }), [selectedCity]);

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
};

export const useCity = () => useContext(CityContext);
