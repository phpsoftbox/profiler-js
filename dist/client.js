const trimRightSlash = (value) => value.replace(/\/+$/, '');
export const normalizeProfilerEndpoint = (endpoint) => {
    const value = typeof endpoint === 'string' && endpoint.trim() !== '' ? endpoint.trim() : '/__profiler';
    return trimRightSlash(value);
};
export const profilerTraceId = (value) => {
    if (!value) {
        return null;
    }
    return value.trace_id ?? value.traceId ?? null;
};
export const profilerTraceUrl = (endpoint, traceId) => {
    return `${normalizeProfilerEndpoint(endpoint)}/api/traces/${encodeURIComponent(traceId)}`;
};
export const profilerTraceListUrl = (endpoint) => {
    return `${normalizeProfilerEndpoint(endpoint)}/api/traces`;
};
export const fetchProfilerTrace = async (endpoint, traceId, signal) => {
    const response = await fetch(profilerTraceUrl(endpoint, traceId), {
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
        },
        signal,
    });
    if (!response.ok) {
        throw new Error(`Profiler trace request failed: ${response.status}`);
    }
    const payload = (await response.json());
    if (!payload.trace) {
        throw new Error('Profiler trace response is empty.');
    }
    return payload.trace;
};
export const fetchProfilerTraces = async (endpoint, signal) => {
    const response = await fetch(profilerTraceListUrl(endpoint), {
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
        },
        signal,
    });
    if (!response.ok) {
        throw new Error(`Profiler traces request failed: ${response.status}`);
    }
    const payload = (await response.json());
    return Array.isArray(payload.traces) ? payload.traces : [];
};
export const sendClientProfilerSpan = (endpoint, traceId, span) => {
    if (!traceId || typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') {
        return;
    }
    const payload = JSON.stringify({
        trace_id: traceId,
        span,
    });
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(`${normalizeProfilerEndpoint(endpoint)}/api/client-spans`, blob);
};
//# sourceMappingURL=client.js.map