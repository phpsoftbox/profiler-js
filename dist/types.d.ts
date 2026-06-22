import type React from 'react';
export type ProfilerSharedProps = {
    enabled?: boolean;
    trace_id?: string | null;
    traceId?: string | null;
    endpoint?: string | null;
};
export type DebugProfilerConfig = ProfilerSharedProps & {
    refreshIntervalMs?: number;
};
export type ProfilerSpan = {
    id: string;
    parent_id?: string | null;
    name: string;
    category?: string | null;
    status?: 'ok' | 'error' | string;
    duration_ms?: number | null;
    memory_delta?: number | null;
    tags?: Record<string, unknown>;
    exception_class?: string | null;
    exception_message?: string | null;
};
export type ProfilerMark = {
    name: string;
    offset_ms?: number;
    tags?: Record<string, unknown>;
};
export type ProfilerTrace = {
    id: string;
    name: string;
    type?: string;
    started_at?: string;
    duration_ms?: number | null;
    memory_delta?: number | null;
    memory_peak?: number | null;
    tags?: Record<string, unknown>;
    spans?: ProfilerSpan[];
    marks?: ProfilerMark[];
    sections?: Record<string, unknown>;
};
export type ProfilerTraceResponse = {
    trace?: ProfilerTrace;
};
export type ProfilerTraceListResponse = {
    traces?: ProfilerTrace[];
};
export type ClientProfilerSpan = {
    name: string;
    duration_ms: number;
    tags?: Record<string, unknown>;
    started_at?: string;
};
export type DebugContextValue = {
    enabled: boolean;
    traceId: string | null;
    endpoint: string;
    trace: ProfilerTrace | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    mark: (name: string, tags?: Record<string, unknown>) => void;
    span: <T>(name: string, callback: () => T, tags?: Record<string, unknown>) => T;
    sendClientSpan: (span: ClientProfilerSpan) => void;
};
export type DebugProviderProps = {
    profiler?: DebugProfilerConfig | null;
    endpoint?: string;
    enabled?: boolean;
    traceId?: string | null;
    refreshIntervalMs?: number;
    children: React.ReactNode;
};
export type ProfilerDebugPanelClassNames = Partial<Record<'root' | 'launcher' | 'panel' | 'header' | 'title' | 'traceId' | 'actions' | 'actionButton' | 'summary' | 'metric' | 'metricLabel' | 'metricValue' | 'body' | 'nav' | 'navItem' | 'navItemActive' | 'navItemCount' | 'content' | 'table' | 'tableHeader' | 'tableCell' | 'code' | 'muted' | 'error' | 'raw', string>>;
export type ProfilerDebugPanelStyle = React.CSSProperties & Partial<Record<`--psb-debug-${string}`, string | number>>;
export type ProfilerDebugPanelProps = {
    className?: string;
    classNames?: ProfilerDebugPanelClassNames;
    style?: ProfilerDebugPanelStyle;
    defaultOpen?: boolean;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
};
