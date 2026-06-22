import React from 'react';
import type { DebugContextValue, DebugProviderProps } from './types';
export declare const DebugProvider: ({ profiler, endpoint, enabled, traceId, refreshIntervalMs, children, }: DebugProviderProps) => React.JSX.Element;
export declare const useDebug: () => DebugContextValue;
export declare const useProfiler: () => DebugContextValue;
