"use client";
import { useEffect, useRef, useState } from 'react';
import { getNeonConfig, getNeonConfigVersion } from '../api/neonStackApi';

export function useNeonConfig(configurator = 'custom_neon') {
  const [config, setConfig] = useState(null);
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const abortRef = useRef(null);

  const fetchConfig = async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNeonConfig(configurator);
      if (!signal?.aborted) {
        setConfig(data);
        setRevision(data?.config_revision ?? null);
        setDisabled(Boolean(data?.enabled === false));
      }
    } catch (err) {
      if (!signal?.aborted) {
        setError(err.message);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    fetchConfig(controller.signal);
    return () => controller.abort();
  }, [configurator]);

  return { config, revision, loading, error, disabled, refetch: fetchConfig, setConfig };
}

export function useNeonConfigRevision(configurator = 'custom_neon', intervalMs = 30000) {
  const [revision, setRevision] = useState(null);
  const [version, setVersion] = useState(null);

  useEffect(() => {
    let active = true;
    const tick = async () => {
      try {
        const data = await getNeonConfigVersion();
        if (active) {
          setVersion(data?.version ?? null);
          setRevision(data?.config_revision ?? null);
        }
      } catch {
        // ignore background refresh errors
      }
    };
    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [configurator, intervalMs]);

  return { revision, version };
}
