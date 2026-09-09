"use client";
import { useCallback, useRef, useState } from 'react';
import { getNeonQuote } from '../api/neonStackApi';

export function useNeonQuote(configurator = 'custom_neon') {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const quote = useCallback(async (design) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNeonQuote(configurator, design);
      setPricing(data?.pricing || data);
      return data;
    } catch (err) {
      setError(err.message);
      setPricing(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [configurator]);

  const debouncedQuote = useCallback((design, delay = 400) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => quote(design), delay);
  }, [quote]);

  return { pricing, loading, error, quote, debouncedQuote };
}
