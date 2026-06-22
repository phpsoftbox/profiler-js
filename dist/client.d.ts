import type { ClientProfilerSpan, ProfilerTrace } from './types';
export declare const normalizeProfilerEndpoint: (endpoint?: string | null) => string;
export declare const profilerTraceId: (value?: {
    trace_id?: string | null;
    traceId?: string | null;
} | null) => string | null;
export declare const profilerTraceUrl: (endpoint: string, traceId: string) => string;
export declare const profilerTraceListUrl: (endpoint: string) => string;
export declare const fetchProfilerTrace: (endpoint: string, traceId: string, signal?: AbortSignal) => Promise<ProfilerTrace>;
export declare const fetchProfilerTraces: (endpoint: string, signal?: AbortSignal) => Promise<ProfilerTrace[]>;
export declare const sendClientProfilerSpan: (endpoint: string, traceId: string | null, span: ClientProfilerSpan) => void;
