import { useMemo, useState } from 'react';
import { useDebug } from './DebugProvider';
import type { ProfilerDebugPanelClassNames, ProfilerDebugPanelProps, ProfilerSpan, ProfilerTrace } from './types';
import './ProfilerDebugPanel.css';

type SectionName = 'timeline' | 'database' | 'router' | 'container' | 'raw';

const cx = (...items: Array<string | false | null | undefined>): string => {
  return items.filter(Boolean).join(' ');
};

const formatMs = (value: unknown): string => {
  return typeof value === 'number' ? `${value.toFixed(value >= 100 ? 0 : 2)} ms` : 'n/a';
};

const formatBytes = (value: unknown): string => {
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

const sectionRecord = (trace: ProfilerTrace | null, key: string): Record<string, unknown> => {
  const value = trace?.sections?.[key];

  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
};

const objectRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
};

const arraySection = (section: Record<string, unknown>, key: string): Array<Record<string, unknown>> => {
  const value = section[key];

  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => (
    item !== null && typeof item === 'object' && !Array.isArray(item)
  )) : [];
};

const label = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return String(value);
};

type ClassNamesProps = {
  classNames?: ProfilerDebugPanelClassNames;
};

const TraceSummary = ({ trace, classNames }: { trace: ProfilerTrace | null } & ClassNamesProps) => {
  const database = sectionRecord(trace, 'database');
  const dbSummary = objectRecord(database.summary);
  const container = sectionRecord(trace, 'container');
  const containerSummary = objectRecord(container.summary);

  return (
    <div className={cx('psb-debug__summary', classNames?.summary)}>
      <div className={cx('psb-debug__metric', classNames?.metric)}>
        <span className={cx('psb-debug__metric-label', classNames?.metricLabel)}>Trace</span>
        <span className={cx('psb-debug__metric-value', classNames?.metricValue)}>{trace?.id ?? '-'}</span>
      </div>
      <div className={cx('psb-debug__metric', classNames?.metric)}>
        <span className={cx('psb-debug__metric-label', classNames?.metricLabel)}>Duration</span>
        <span className={cx('psb-debug__metric-value', classNames?.metricValue)}>{formatMs(trace?.duration_ms)}</span>
      </div>
      <div className={cx('psb-debug__metric', classNames?.metric)}>
        <span className={cx('psb-debug__metric-label', classNames?.metricLabel)}>DB</span>
        <span className={cx('psb-debug__metric-value', classNames?.metricValue)}>
          {label(dbSummary.queries)} / {formatMs(dbSummary.total_ms)}
        </span>
      </div>
      <div className={cx('psb-debug__metric', classNames?.metric)}>
        <span className={cx('psb-debug__metric-label', classNames?.metricLabel)}>Container</span>
        <span className={cx('psb-debug__metric-value', classNames?.metricValue)}>
          {label(containerSummary.count)} resolves
        </span>
      </div>
      <div className={cx('psb-debug__metric', classNames?.metric)}>
        <span className={cx('psb-debug__metric-label', classNames?.metricLabel)}>Peak</span>
        <span className={cx('psb-debug__metric-value', classNames?.metricValue)}>{formatBytes(trace?.memory_peak)}</span>
      </div>
    </div>
  );
};

const TimelineView = ({ spans, classNames }: { spans: ProfilerSpan[] } & ClassNamesProps) => (
  <table className={cx('psb-debug__table', classNames?.table)}>
    <thead>
      <tr>
        <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Span</th>
        <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Category</th>
        <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Status</th>
        <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Duration</th>
        <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Tags</th>
      </tr>
    </thead>
    <tbody>
      {spans.map((span) => (
        <tr key={span.id}>
          <td className={cx('psb-debug__table-cell', 'psb-debug__code', classNames?.tableCell, classNames?.code)}>
            {span.name}
          </td>
          <td className={cx('psb-debug__table-cell', classNames?.tableCell)}>{span.category ?? '-'}</td>
          <td className={cx('psb-debug__table-cell', classNames?.tableCell)}>{span.status ?? 'ok'}</td>
          <td className={cx('psb-debug__table-cell', classNames?.tableCell)}>{formatMs(span.duration_ms)}</td>
          <td className={cx('psb-debug__table-cell', 'psb-debug__code', classNames?.tableCell, classNames?.code)}>
            {JSON.stringify(span.tags ?? {})}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const DatabaseView = ({ trace, classNames }: { trace: ProfilerTrace | null } & ClassNamesProps) => {
  const database = sectionRecord(trace, 'database');
  const queries = arraySection(database, 'queries');

  return (
    <table className={cx('psb-debug__table', classNames?.table)}>
      <thead>
        <tr>
          <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Connection</th>
          <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Driver</th>
          <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Duration</th>
          <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Rows</th>
          <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>SQL</th>
        </tr>
      </thead>
      <tbody>
        {queries.map((query, index) => (
          <tr key={`${query.sql}-${index}`}>
            <td className={cx('psb-debug__table-cell', classNames?.tableCell)}>{label(query.connection)}</td>
            <td className={cx('psb-debug__table-cell', classNames?.tableCell)}>{label(query.driver)}</td>
            <td className={cx('psb-debug__table-cell', classNames?.tableCell)}>{formatMs(query.duration_ms)}</td>
            <td className={cx('psb-debug__table-cell', classNames?.tableCell)}>{label(query.row_count)}</td>
            <td className={cx('psb-debug__table-cell', 'psb-debug__code', classNames?.tableCell, classNames?.code)}>
              {label(query.sql)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const RouterView = ({ trace, classNames }: { trace: ProfilerTrace | null } & ClassNamesProps) => {
  const router = sectionRecord(trace, 'router');
  const routes = arraySection(router, 'routes');

  return (
    <table className={cx('psb-debug__table', classNames?.table)}>
      <thead>
        <tr>
          <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Event</th>
          <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Route</th>
          <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Path</th>
          <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Status</th>
          <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Duration</th>
        </tr>
      </thead>
      <tbody>
        {routes.map((route, index) => (
          <tr key={`${route.event}-${index}`}>
            <td className={cx('psb-debug__table-cell', classNames?.tableCell)}>{label(route.event)}</td>
            <td className={cx('psb-debug__table-cell', classNames?.tableCell)}>{label(route.name)}</td>
            <td className={cx('psb-debug__table-cell', 'psb-debug__code', classNames?.tableCell, classNames?.code)}>
              {label(route.path)}
            </td>
            <td className={cx('psb-debug__table-cell', classNames?.tableCell)}>{label(route.status_code)}</td>
            <td className={cx('psb-debug__table-cell', classNames?.tableCell)}>{formatMs(route.duration_ms)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ContainerView = ({ trace, classNames }: { trace: ProfilerTrace | null } & ClassNamesProps) => {
  const container = sectionRecord(trace, 'container');
  const resolves = arraySection(container, 'resolves');

  return (
    <table className={cx('psb-debug__table', classNames?.table)}>
      <thead>
        <tr>
          <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Service</th>
          <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Count</th>
          <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Cached</th>
          <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Errors</th>
          <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Total</th>
          <th className={cx('psb-debug__table-header', classNames?.tableHeader)}>Max</th>
        </tr>
      </thead>
      <tbody>
        {resolves.map((resolve) => (
          <tr key={label(resolve.id)}>
            <td className={cx('psb-debug__table-cell', 'psb-debug__code', classNames?.tableCell, classNames?.code)}>
              {label(resolve.id)}
            </td>
            <td className={cx('psb-debug__table-cell', classNames?.tableCell)}>{label(resolve.count)}</td>
            <td className={cx('psb-debug__table-cell', classNames?.tableCell)}>{label(resolve.cached_hits)}</td>
            <td className={cx('psb-debug__table-cell', classNames?.tableCell)}>{label(resolve.errors)}</td>
            <td className={cx('psb-debug__table-cell', classNames?.tableCell)}>{formatMs(resolve.total_ms)}</td>
            <td className={cx('psb-debug__table-cell', classNames?.tableCell)}>{formatMs(resolve.max_ms)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const RawView = ({ trace, classNames }: { trace: ProfilerTrace | null } & ClassNamesProps) => (
  <pre className={cx('psb-debug__raw', 'psb-debug__code', classNames?.raw, classNames?.code)}>
    {JSON.stringify(trace, null, 2)}
  </pre>
);

export const ProfilerDebugPanel = ({
  className,
  classNames,
  style,
  defaultOpen = false,
  position = 'bottom-right',
}: ProfilerDebugPanelProps) => {
  const { enabled, trace, traceId, loading, error, refresh } = useDebug();
  const [open, setOpen] = useState(defaultOpen);
  const [section, setSection] = useState<SectionName>('timeline');

  const spans = useMemo(() => Array.isArray(trace?.spans) ? trace.spans : [], [trace]);
  const databaseQueries = arraySection(sectionRecord(trace, 'database'), 'queries').length;
  const containerResolves = arraySection(sectionRecord(trace, 'container'), 'resolves').length;
  const routerEvents = arraySection(sectionRecord(trace, 'router'), 'routes').length;

  if (!enabled) {
    return null;
  }

  const navItems: Array<{ id: SectionName; label: string; count?: number }> = [
    { id: 'timeline', label: 'Timeline', count: spans.length },
    { id: 'database', label: 'Database', count: databaseQueries },
    { id: 'router', label: 'Router', count: routerEvents },
    { id: 'container', label: 'Container', count: containerResolves },
    { id: 'raw', label: 'Raw' },
  ];

  const renderContent = () => {
    if (error) {
      return <div className={cx('psb-debug__error', classNames?.error)}>{error}</div>;
    }

    if (!trace && loading) {
      return <div className={cx('psb-debug__muted', classNames?.muted)}>Loading profiler trace...</div>;
    }

    if (!trace) {
      return <div className={cx('psb-debug__muted', classNames?.muted)}>Trace is not available yet.</div>;
    }

    switch (section) {
      case 'database':
        return <DatabaseView trace={trace} classNames={classNames} />;
      case 'router':
        return <RouterView trace={trace} classNames={classNames} />;
      case 'container':
        return <ContainerView trace={trace} classNames={classNames} />;
      case 'raw':
        return <RawView trace={trace} classNames={classNames} />;
      case 'timeline':
      default:
        return <TimelineView spans={spans} classNames={classNames} />;
    }
  };

  return (
    <div
      className={cx('psb-debug', `psb-debug--${position}`, classNames?.root, className)}
      style={style}
    >
      {!open ? (
        <button
          type="button"
          className={cx('psb-debug__launcher', classNames?.launcher)}
          onClick={() => setOpen(true)}
        >
          Debug
        </button>
      ) : (
        <section className={cx('psb-debug__panel', classNames?.panel)}>
          <header className={cx('psb-debug__header', classNames?.header)}>
            <div>
              <h2 className={cx('psb-debug__title', classNames?.title)}>PhpSoftBox Debug</h2>
              <div className={cx('psb-debug__trace-id', 'psb-debug__muted', classNames?.traceId, classNames?.muted)}>
                {traceId ?? 'no trace'}
              </div>
            </div>
            <div className={cx('psb-debug__actions', classNames?.actions)}>
              <button
                type="button"
                className={cx('psb-debug__action', classNames?.actionButton)}
                onClick={() => void refresh()}
              >
                Refresh
              </button>
              <button
                type="button"
                className={cx('psb-debug__action', classNames?.actionButton)}
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </header>

          <TraceSummary trace={trace} classNames={classNames} />

          <div className={cx('psb-debug__body', classNames?.body)}>
            <nav className={cx('psb-debug__nav', classNames?.nav)}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cx(
                    'psb-debug__nav-item',
                    section === item.id && 'psb-debug__nav-item--active',
                    classNames?.navItem,
                    section === item.id && classNames?.navItemActive,
                  )}
                  onClick={() => setSection(item.id)}
                >
                  <span>{item.label}</span>
                  {typeof item.count === 'number' ? (
                    <span className={cx('psb-debug__nav-count', classNames?.navItemCount)}>
                      {item.count}
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>
            <main className={cx('psb-debug__content', classNames?.content)}>{renderContent()}</main>
          </div>
        </section>
      )}
    </div>
  );
};

export const ProfilerDebugButton = ProfilerDebugPanel;
