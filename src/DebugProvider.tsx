import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { fetchProfilerTrace, normalizeProfilerEndpoint, profilerTraceId, sendClientProfilerSpan } from './client';
import type { ClientProfilerSpan, DebugContextValue, DebugProviderProps, ProfilerTrace } from './types';

const DebugContext = createContext<DebugContextValue | null>(null);

export const DebugProvider = ({
  profiler,
  endpoint,
  enabled,
  traceId,
  refreshIntervalMs,
  children,
}: DebugProviderProps) => {
  const resolvedEndpoint = normalizeProfilerEndpoint(endpoint ?? profiler?.endpoint);
  const resolvedTraceId = traceId ?? profilerTraceId(profiler);
  const resolvedEnabled = enabled ?? profiler?.enabled === true;
  const resolvedRefreshIntervalMs = refreshIntervalMs ?? profiler?.refreshIntervalMs;

  const [trace, setTrace] = useState<ProfilerTrace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!resolvedEnabled || !resolvedTraceId) {
      setTrace(null);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const nextTrace = await fetchProfilerTrace(resolvedEndpoint, resolvedTraceId, controller.signal);
      setTrace(nextTrace);
    } catch (refreshError) {
      if (controller.signal.aborted) {
        return;
      }

      setError(refreshError instanceof Error ? refreshError.message : 'Profiler trace request failed.');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [resolvedEnabled, resolvedEndpoint, resolvedTraceId]);

  const sendClientSpan = useCallback((span: ClientProfilerSpan): void => {
    sendClientProfilerSpan(resolvedEndpoint, resolvedTraceId, span);
  }, [resolvedEndpoint, resolvedTraceId]);

  const mark = useCallback((name: string, tags: Record<string, unknown> = {}): void => {
    sendClientSpan({
      name,
      duration_ms: 0,
      tags,
      started_at: new Date().toISOString(),
    });
  }, [sendClientSpan]);

  const span = useCallback(<T,>(name: string, callback: () => T, tags: Record<string, unknown> = {}): T => {
    const started = performance.now();
    const startedAt = new Date().toISOString();

    try {
      return callback();
    } finally {
      sendClientSpan({
        name,
        duration_ms: Number((performance.now() - started).toFixed(3)),
        tags,
        started_at: startedAt,
      });
    }
  }, [sendClientSpan]);

  useEffect(() => {
    void refresh();

    return () => {
      abortRef.current?.abort();
    };
  }, [refresh]);

  useEffect(() => {
    if (!resolvedRefreshIntervalMs || resolvedRefreshIntervalMs <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      void refresh();
    }, resolvedRefreshIntervalMs);

    return () => window.clearInterval(timer);
  }, [refresh, resolvedRefreshIntervalMs]);

  const value = useMemo<DebugContextValue>(() => ({
    enabled: resolvedEnabled,
    traceId: resolvedTraceId,
    endpoint: resolvedEndpoint,
    trace,
    loading,
    error,
    refresh,
    mark,
    span,
    sendClientSpan,
  }), [
    resolvedEnabled,
    resolvedTraceId,
    resolvedEndpoint,
    trace,
    loading,
    error,
    refresh,
    mark,
    span,
    sendClientSpan,
  ]);

  return (
    <DebugContext.Provider value={value}>
      {children}
    </DebugContext.Provider>
  );
};

export const useDebug = (): DebugContextValue => {
  const context = useContext(DebugContext);
  if (context === null) {
    throw new Error('useDebug must be used inside DebugProvider.');
  }

  return context;
};

export const useProfiler = useDebug;
