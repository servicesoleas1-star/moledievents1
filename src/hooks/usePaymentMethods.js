import { useEffect, useState } from 'react';

/**
 * Fetches the list of payment operators from the backend. Each one is
 * expected to have a logo_url; if that image fails to load, the UI
 * falls back to showing the operator's initials instead.
 */
export function usePaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/payment-methods')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setMethods(data.ok ? data.methods : []);
      })
      .catch(() => {
        if (!cancelled) setMethods([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { methods, loading };
}
