import type {
  ClientProfilerSpan,
  ProfilerTrace,
  ProfilerTraceListResponse,
  ProfilerTraceResponse,
} from './types';

const trimRightSlash = (value: string): string => value.replace(/\/+$/, '');

export const normalizeProfilerEndpoint = (endpoint?: string | null): string => {
  const value = typeof endpoint === 'string' && endpoint.trim() !== '' ? endpoint.trim() : '/__profiler';

  return trimRightSlash(value);
};

export const profilerTraceId = (value?: { trace_id?: string | null; traceId?: string | null } | null): string | null => {
  if (!value) {
    return null;
  }

  return value.trace_id ?? value.traceId ?? null;
};

export const profilerTraceUrl = (endpoint: string, traceId: string): string => {
  return `${normalizeProfilerEndpoint(endpoint)}/api/traces/${encodeURIComponent(traceId)}`;
};

export const profilerTraceListUrl = (endpoint: string): string => {
  return `${normalizeProfilerEndpoint(endpoint)}/api/traces`;
};

export const fetchProfilerTrace = async (endpoint: string, traceId: string, signal?: AbortSignal): Promise<ProfilerTrace> => {
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

  const payload = (await response.json()) as ProfilerTraceResponse;
  if (!payload.trace) {
    throw new Error('Profiler trace response is empty.');
  }

  return payload.trace;
};

export const fetchProfilerTraces = async (endpoint: string, signal?: AbortSignal): Promise<ProfilerTrace[]> => {
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

  const payload = (await response.json()) as ProfilerTraceListResponse;

  return Array.isArray(payload.traces) ? payload.traces : [];
};

export const sendClientProfilerSpan = (endpoint: string, traceId: string | null, span: ClientProfilerSpan): void => {
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
