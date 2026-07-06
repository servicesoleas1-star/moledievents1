import { useEffect, useState } from 'react';

/**
 * Fetches the list of countries from the backend when the component
 * mounts. Comes back as an empty array if nothing's set up yet or if
 * the request fails.
 */
export function useCountries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/countries')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setCountries(data.ok ? data.countries : []);
      })
      .catch(() => {
        if (!cancelled) setCountries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { countries, loading };
}
