import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, } from 'react';
import { fetchProfilerTrace, normalizeProfilerEndpoint, profilerTraceId, sendClientProfilerSpan } from './client';
const DebugContext = createContext(null);
export const DebugProvider = ({ profiler, endpoint, enabled, traceId, refreshIntervalMs, children, }) => {
    const resolvedEndpoint = normalizeProfilerEndpoint(endpoint ?? profiler?.endpoint);
    const resolvedTraceId = traceId ?? profilerTraceId(profiler);
    const resolvedEnabled = enabled ?? profiler?.enabled === true;
    const resolvedRefreshIntervalMs = refreshIntervalMs ?? profiler?.refreshIntervalMs;
    const [trace, setTrace] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortRef = useRef(null);
    const refresh = useCallback(async () => {
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
        }
        catch (refreshError) {
            if (controller.signal.aborted) {
                return;
            }
            setError(refreshError instanceof Error ? refreshError.message : 'Profiler trace request failed.');
        }
        finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    }, [resolvedEnabled, resolvedEndpoint, resolvedTraceId]);
    const sendClientSpan = useCallback((span) => {
        sendClientProfilerSpan(resolvedEndpoint, resolvedTraceId, span);
    }, [resolvedEndpoint, resolvedTraceId]);
    const mark = useCallback((name, tags = {}) => {
        sendClientSpan({
            name,
            duration_ms: 0,
            tags,
            started_at: new Date().toISOString(),
        });
    }, [sendClientSpan]);
    const span = useCallback((name, callback, tags = {}) => {
        const started = performance.now();
        const startedAt = new Date().toISOString();
        try {
            return callback();
        }
        finally {
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
    const value = useMemo(() => ({
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
    return (_jsx(DebugContext.Provider, { value: value, children: children }));
};
export const useDebug = () => {
    const context = useContext(DebugContext);
    if (context === null) {
        throw new Error('useDebug must be used inside DebugProvider.');
    }
    return context;
};
export const useProfiler = useDebug;
//# sourceMappingURL=DebugProvider.js.map