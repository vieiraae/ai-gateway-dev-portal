import { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollText, Search, X, RefreshCw } from 'lucide-react';
import { useAzure } from '../context/AzureContext';
import { createMsalCredential, queryLogAnalytics } from '../services/azure';
import { useMsal } from '@azure/msal-react';

type TimeRange = '1h' | '24h';

interface LlmLogRow {
  timestamp: string;
  model: string;
  tokens: number;
  input: string;
  output: string;
  id: string;
}

function buildKql(timeRange: TimeRange): string {
  return `ApiManagementGatewayLlmLog
| where TimeGenerated > ago(${timeRange})
| extend RequestArray = parse_json(RequestMessages)
| extend ResponseArray = parse_json(ResponseMessages)
| mv-expand RequestArray
| mv-expand ResponseArray
| project CorrelationId, RequestContent = tostring(RequestArray.content), ResponseContent = tostring(ResponseArray.content), ModelName, TotalTokens, DeploymentName, TimeGenerated
| summarize input = strcat_array(make_list(RequestContent), ' '), output = strcat_array(make_list(ResponseContent), ' '), ModelName = take_any(ModelName), TotalTokens = sum(TotalTokens), DeploymentName = take_any(DeploymentName), TimeGenerated = max(TimeGenerated) by CorrelationId
| where isnotempty(input) and isnotempty(output)
| project timestamp = TimeGenerated, model = ModelName, tokens = TotalTokens, input, output, id = CorrelationId
| order by timestamp desc`;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '…';
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return ts;
  }
}

export default function Logs() {
  const { config } = useAzure();
  const { instance } = useMsal();

  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [modelFilter, setModelFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<LlmLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<LlmLogRow | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  const service = config.apimService;

  const getCredential = useCallback(() => createMsalCredential(instance), [instance]);

  const fetchLogs = useCallback(async () => {
    if (!service) return;
    setLoading(true);
    setError(null);
    try {
      const result = await queryLogAnalytics(getCredential(), service.id, buildKql(timeRange));
      setRows(
        result.map((r) => ({
          timestamp: String(r.timestamp ?? ''),
          model: String(r.model ?? ''),
          tokens: Number(r.tokens ?? 0),
          input: String(r.input ?? ''),
          output: String(r.output ?? ''),
          id: String(r.id ?? ''),
        })),
      );
    } catch (err) {
      console.error('Failed to query logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to query logs');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [service, getCredential, timeRange]);

  useEffect(() => {
    if (service) void fetchLogs();
  }, [service, fetchLogs]);

  const closePanel = useCallback(() => setSelected(null), []);

  useEffect(() => {
    window.addEventListener('close-detail-panel', closePanel);
    return () => window.removeEventListener('close-detail-panel', closePanel);
  }, [closePanel]);

  // Unique models for filter dropdown
  const models = [...new Set(rows.map((r) => r.model).filter(Boolean))].sort();

  // Client-side filtering
  const filtered = rows.filter((r) => {
    if (modelFilter !== 'all' && r.model !== modelFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.input.toLowerCase().includes(q) && !r.output.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (!service) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Logs</h1>
          <p className="page-description">
            View request logs and diagnostic traces from Azure Monitor.
          </p>
        </div>
        <div className="page-empty">
          <ScrollText className="page-empty-icon" />
          <div className="page-empty-title">No APIM service selected</div>
          <p className="page-empty-text">
            Use the workspace selector to choose an APIM instance first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container logs-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Logs</h1>
          <p className="page-description">
            LLM request logs from Azure Monitor — {service.name}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sub-toolbar">
        <div className="sub-search">
          <Search size={14} className="sub-search-icon" />
          <input
            type="text"
            placeholder="Search input / output…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sub-filters">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as TimeRange)}>
            <option value="1h">Last hour</option>
            <option value="24h">Last 24 hours</option>
          </select>
          <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
            <option value="all">All models</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button className="logs-refresh-btn" onClick={() => void fetchLogs()} disabled={loading} title="Refresh">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && rows.length === 0 ? (
        <div className="page-empty"><span className="spinner" /></div>
      ) : error ? (
        <div className="page-empty">
          <ScrollText className="page-empty-icon" />
          <div className="page-empty-title">Query failed</div>
          <p className="page-empty-text">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="page-empty">
          <ScrollText className="page-empty-icon" />
          <div className="page-empty-title">
            {rows.length === 0 ? 'No logs found' : 'No matching logs'}
          </div>
          <p className="page-empty-text">
            {rows.length === 0
              ? 'No LLM requests found in the selected time range.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="sub-table-wrap">
          <table className="sub-table logs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Model</th>
                <th>Tokens</th>
                <th>Input</th>
                <th>Output</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className={`sub-row${selected?.id === row.id ? ' selected' : ''}`}
                  onClick={() => setSelected(row)}
                >
                  <td className="logs-ts-cell">{formatTimestamp(row.timestamp)}</td>
                  <td><span className="logs-model-badge">{row.model || '—'}</span></td>
                  <td className="logs-tokens-cell">{row.tokens.toLocaleString()}</td>
                  <td className="logs-text-cell" title={row.input}>{truncate(row.input, 80)}</td>
                  <td className="logs-text-cell" title={row.output}>{truncate(row.output, 80)}</td>
                  <td className="logs-id-cell" title={row.id}>{truncate(row.id, 12)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Panel */}
      {selected && (
        <div className="sub-panel-overlay" onClick={closePanel}>
          <div className="sub-panel logs-panel" ref={panelRef} onClick={(e) => e.stopPropagation()}>
            <div className="sub-panel-header">
              <h2>Request details</h2>
              <button className="icon-btn" onClick={closePanel}><X size={16} /></button>
            </div>
            <div className="sub-panel-body">
              <div className="sub-panel-fields">
                <div className="sub-panel-field">
                  <label>Correlation ID</label>
                  <span className="logs-detail-mono">{selected.id}</span>
                </div>
                <div className="sub-panel-field">
                  <label>Timestamp</label>
                  <span>{new Date(selected.timestamp).toLocaleString()}</span>
                </div>
                <div className="sub-panel-field">
                  <label>Model</label>
                  <span className="logs-model-badge">{selected.model || '—'}</span>
                </div>
                <div className="sub-panel-field">
                  <label>Tokens</label>
                  <span>{selected.tokens.toLocaleString()}</span>
                </div>
              </div>
              <div className="logs-detail-section">
                <label className="logs-detail-label">Input</label>
                <div className="logs-detail-text">{selected.input}</div>
              </div>
              <div className="logs-detail-section">
                <label className="logs-detail-label">Output</label>
                <div className="logs-detail-text">{selected.output}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
