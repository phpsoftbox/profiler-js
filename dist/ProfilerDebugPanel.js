import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useDebug } from './DebugProvider';
import './ProfilerDebugPanel.css';
const cx = (...items) => {
    return items.filter(Boolean).join(' ');
};
const formatMs = (value) => {
    return typeof value === 'number' ? `${value.toFixed(value >= 100 ? 0 : 2)} ms` : 'n/a';
};
const formatBytes = (value) => {
    if (typeof value !== 'number') {
        return 'n/a';
    }
    if (Math.abs(value) >= 1024 * 1024) {
        return `${(value / 1024 / 1024).toFixed(2)} MB`;
    }
    if (Math.abs(value) >= 1024) {
        return `${(value / 1024).toFixed(1)} KB`;
    }
    return `${value} B`;
};
const sectionRecord = (trace, key) => {
    const value = trace?.sections?.[key];
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
};
const objectRecord = (value) => {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
};
const arraySection = (section, key) => {
    const value = section[key];
    return Array.isArray(value) ? value.filter((item) => (item !== null && typeof item === 'object' && !Array.isArray(item))) : [];
};
const label = (value) => {
    if (value === null || value === undefined || value === '') {
        return '-';
    }
    return String(value);
};
const TraceSummary = ({ trace, classNames }) => {
    const database = sectionRecord(trace, 'database');
    const dbSummary = objectRecord(database.summary);
    const container = sectionRecord(trace, 'container');
    const containerSummary = objectRecord(container.summary);
    return (_jsxs("div", { className: cx('psb-debug__summary', classNames?.summary), children: [_jsxs("div", { className: cx('psb-debug__metric', classNames?.metric), children: [_jsx("span", { className: cx('psb-debug__metric-label', classNames?.metricLabel), children: "Trace" }), _jsx("span", { className: cx('psb-debug__metric-value', classNames?.metricValue), children: trace?.id ?? '-' })] }), _jsxs("div", { className: cx('psb-debug__metric', classNames?.metric), children: [_jsx("span", { className: cx('psb-debug__metric-label', classNames?.metricLabel), children: "Duration" }), _jsx("span", { className: cx('psb-debug__metric-value', classNames?.metricValue), children: formatMs(trace?.duration_ms) })] }), _jsxs("div", { className: cx('psb-debug__metric', classNames?.metric), children: [_jsx("span", { className: cx('psb-debug__metric-label', classNames?.metricLabel), children: "DB" }), _jsxs("span", { className: cx('psb-debug__metric-value', classNames?.metricValue), children: [label(dbSummary.queries), " / ", formatMs(dbSummary.total_ms)] })] }), _jsxs("div", { className: cx('psb-debug__metric', classNames?.metric), children: [_jsx("span", { className: cx('psb-debug__metric-label', classNames?.metricLabel), children: "Container" }), _jsxs("span", { className: cx('psb-debug__metric-value', classNames?.metricValue), children: [label(containerSummary.count), " resolves"] })] }), _jsxs("div", { className: cx('psb-debug__metric', classNames?.metric), children: [_jsx("span", { className: cx('psb-debug__metric-label', classNames?.metricLabel), children: "Peak" }), _jsx("span", { className: cx('psb-debug__metric-value', classNames?.metricValue), children: formatBytes(trace?.memory_peak) })] })] }));
};
const TimelineView = ({ spans, classNames }) => (_jsxs("table", { className: cx('psb-debug__table', classNames?.table), children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Span" }), _jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Category" }), _jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Status" }), _jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Duration" }), _jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Tags" })] }) }), _jsx("tbody", { children: spans.map((span) => (_jsxs("tr", { children: [_jsx("td", { className: cx('psb-debug__table-cell', 'psb-debug__code', classNames?.tableCell, classNames?.code), children: span.name }), _jsx("td", { className: cx('psb-debug__table-cell', classNames?.tableCell), children: span.category ?? '-' }), _jsx("td", { className: cx('psb-debug__table-cell', classNames?.tableCell), children: span.status ?? 'ok' }), _jsx("td", { className: cx('psb-debug__table-cell', classNames?.tableCell), children: formatMs(span.duration_ms) }), _jsx("td", { className: cx('psb-debug__table-cell', 'psb-debug__code', classNames?.tableCell, classNames?.code), children: JSON.stringify(span.tags ?? {}) })] }, span.id))) })] }));
const DatabaseView = ({ trace, classNames }) => {
    const database = sectionRecord(trace, 'database');
    const queries = arraySection(database, 'queries');
    return (_jsxs("table", { className: cx('psb-debug__table', classNames?.table), children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Connection" }), _jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Driver" }), _jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Duration" }), _jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Rows" }), _jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "SQL" })] }) }), _jsx("tbody", { children: queries.map((query, index) => (_jsxs("tr", { children: [_jsx("td", { className: cx('psb-debug__table-cell', classNames?.tableCell), children: label(query.connection) }), _jsx("td", { className: cx('psb-debug__table-cell', classNames?.tableCell), children: label(query.driver) }), _jsx("td", { className: cx('psb-debug__table-cell', classNames?.tableCell), children: formatMs(query.duration_ms) }), _jsx("td", { className: cx('psb-debug__table-cell', classNames?.tableCell), children: label(query.row_count) }), _jsx("td", { className: cx('psb-debug__table-cell', 'psb-debug__code', classNames?.tableCell, classNames?.code), children: label(query.sql) })] }, `${query.sql}-${index}`))) })] }));
};
const RouterView = ({ trace, classNames }) => {
    const router = sectionRecord(trace, 'router');
    const routes = arraySection(router, 'routes');
    return (_jsxs("table", { className: cx('psb-debug__table', classNames?.table), children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Event" }), _jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Route" }), _jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Path" }), _jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Status" }), _jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Duration" })] }) }), _jsx("tbody", { children: routes.map((route, index) => (_jsxs("tr", { children: [_jsx("td", { className: cx('psb-debug__table-cell', classNames?.tableCell), children: label(route.event) }), _jsx("td", { className: cx('psb-debug__table-cell', classNames?.tableCell), children: label(route.name) }), _jsx("td", { className: cx('psb-debug__table-cell', 'psb-debug__code', classNames?.tableCell, classNames?.code), children: label(route.path) }), _jsx("td", { className: cx('psb-debug__table-cell', classNames?.tableCell), children: label(route.status_code) }), _jsx("td", { className: cx('psb-debug__table-cell', classNames?.tableCell), children: formatMs(route.duration_ms) })] }, `${route.event}-${index}`))) })] }));
};
const ContainerView = ({ trace, classNames }) => {
    const container = sectionRecord(trace, 'container');
    const resolves = arraySection(container, 'resolves');
    return (_jsxs("table", { className: cx('psb-debug__table', classNames?.table), children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Service" }), _jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Count" }), _jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Cached" }), _jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Errors" }), _jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Total" }), _jsx("th", { className: cx('psb-debug__table-header', classNames?.tableHeader), children: "Max" })] }) }), _jsx("tbody", { children: resolves.map((resolve) => (_jsxs("tr", { children: [_jsx("td", { className: cx('psb-debug__table-cell', 'psb-debug__code', classNames?.tableCell, classNames?.code), children: label(resolve.id) }), _jsx("td", { className: cx('psb-debug__table-cell', classNames?.tableCell), children: label(resolve.count) }), _jsx("td", { className: cx('psb-debug__table-cell', classNames?.tableCell), children: label(resolve.cached_hits) }), _jsx("td", { className: cx('psb-debug__table-cell', classNames?.tableCell), children: label(resolve.errors) }), _jsx("td", { className: cx('psb-debug__table-cell', classNames?.tableCell), children: formatMs(resolve.total_ms) }), _jsx("td", { className: cx('psb-debug__table-cell', classNames?.tableCell), children: formatMs(resolve.max_ms) })] }, label(resolve.id)))) })] }));
};
const RawView = ({ trace, classNames }) => (_jsx("pre", { className: cx('psb-debug__raw', 'psb-debug__code', classNames?.raw, classNames?.code), children: JSON.stringify(trace, null, 2) }));
export const ProfilerDebugPanel = ({ className, classNames, style, defaultOpen = false, position = 'bottom-right', }) => {
    const { enabled, trace, traceId, loading, error, refresh } = useDebug();
    const [open, setOpen] = useState(defaultOpen);
    const [section, setSection] = useState('timeline');
    const spans = useMemo(() => Array.isArray(trace?.spans) ? trace.spans : [], [trace]);
    const databaseQueries = arraySection(sectionRecord(trace, 'database'), 'queries').length;
    const containerResolves = arraySection(sectionRecord(trace, 'container'), 'resolves').length;
    const routerEvents = arraySection(sectionRecord(trace, 'router'), 'routes').length;
    if (!enabled) {
        return null;
    }
    const navItems = [
        { id: 'timeline', label: 'Timeline', count: spans.length },
        { id: 'database', label: 'Database', count: databaseQueries },
        { id: 'router', label: 'Router', count: routerEvents },
        { id: 'container', label: 'Container', count: containerResolves },
        { id: 'raw', label: 'Raw' },
    ];
    const renderContent = () => {
        if (error) {
            return _jsx("div", { className: cx('psb-debug__error', classNames?.error), children: error });
        }
        if (!trace && loading) {
            return _jsx("div", { className: cx('psb-debug__muted', classNames?.muted), children: "Loading profiler trace..." });
        }
        if (!trace) {
            return _jsx("div", { className: cx('psb-debug__muted', classNames?.muted), children: "Trace is not available yet." });
        }
        switch (section) {
            case 'database':
                return _jsx(DatabaseView, { trace: trace, classNames: classNames });
            case 'router':
                return _jsx(RouterView, { trace: trace, classNames: classNames });
            case 'container':
                return _jsx(ContainerView, { trace: trace, classNames: classNames });
            case 'raw':
                return _jsx(RawView, { trace: trace, classNames: classNames });
            case 'timeline':
            default:
                return _jsx(TimelineView, { spans: spans, classNames: classNames });
        }
    };
    return (_jsx("div", { className: cx('psb-debug', `psb-debug--${position}`, classNames?.root, className), style: style, children: !open ? (_jsx("button", { type: "button", className: cx('psb-debug__launcher', classNames?.launcher), onClick: () => setOpen(true), children: "Debug" })) : (_jsxs("section", { className: cx('psb-debug__panel', classNames?.panel), children: [_jsxs("header", { className: cx('psb-debug__header', classNames?.header), children: [_jsxs("div", { children: [_jsx("h2", { className: cx('psb-debug__title', classNames?.title), children: "PhpSoftBox Debug" }), _jsx("div", { className: cx('psb-debug__trace-id', 'psb-debug__muted', classNames?.traceId, classNames?.muted), children: traceId ?? 'no trace' })] }), _jsxs("div", { className: cx('psb-debug__actions', classNames?.actions), children: [_jsx("button", { type: "button", className: cx('psb-debug__action', classNames?.actionButton), onClick: () => void refresh(), children: "Refresh" }), _jsx("button", { type: "button", className: cx('psb-debug__action', classNames?.actionButton), onClick: () => setOpen(false), children: "Close" })] })] }), _jsx(TraceSummary, { trace: trace, classNames: classNames }), _jsxs("div", { className: cx('psb-debug__body', classNames?.body), children: [_jsx("nav", { className: cx('psb-debug__nav', classNames?.nav), children: navItems.map((item) => (_jsxs("button", { type: "button", className: cx('psb-debug__nav-item', section === item.id && 'psb-debug__nav-item--active', classNames?.navItem, section === item.id && classNames?.navItemActive), onClick: () => setSection(item.id), children: [_jsx("span", { children: item.label }), typeof item.count === 'number' ? (_jsx("span", { className: cx('psb-debug__nav-count', classNames?.navItemCount), children: item.count })) : null] }, item.id))) }), _jsx("main", { className: cx('psb-debug__content', classNames?.content), children: renderContent() })] })] })) }));
};
export const ProfilerDebugButton = ProfilerDebugPanel;
//# sourceMappingURL=ProfilerDebugPanel.js.map