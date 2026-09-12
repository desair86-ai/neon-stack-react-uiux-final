"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getNeonQuote } from "../api/neonStackApi";

export function useNeonQuote(configurator = "custom_neon") {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  const quote = useCallback(async (design) => {
    if (
      !design ||
      !String(design.text || "").trim() ||
      !design.fontId ||
      !design.size ||
      !design.backboard ||
      !design.hardware
    ) {
      return null;
    }

    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const data = await getNeonQuote(configurator, design);

      if (requestId !== requestIdRef.current) return null;

      setPricing(data?.pricing || data);
      return data;
    } catch (err) {
      if (requestId !== requestIdRef.current) return null;

      setError(err?.message || "Unable to calculate price.");
      setPricing(null);
      return null;
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [configurator]);

  const debouncedQuote = useCallback((design, delay = 400) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      quote(design);
    }, delay);
  }, [quote]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      requestIdRef.current += 1;
    };
  }, []);

  return { pricing, loading, error, quote, debouncedQuote };
}
