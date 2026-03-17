import { Activity } from 'lucide-react';

export default function Metrics() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Metrics</h1>
        <p className="page-description">
          Monitor API performance, request counts, and latency from Azure Monitor metrics.
        </p>
      </div>
      <div className="page-empty">
        <Activity className="page-empty-icon" />
        <div className="page-empty-title">No metrics available</div>
        <p className="page-empty-text">
          Select an API Management instance to view its metrics.
        </p>
      </div>
    </div>
  );
}
