import { BarChart3 } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-description">
          Usage analytics, token consumption, and performance metrics from Azure Monitor.
        </p>
      </div>
      <div className="page-empty">
        <BarChart3 className="page-empty-icon" />
        <div className="page-empty-title">No analytics data</div>
        <p className="page-empty-text">
          Analytics will be available once your gateway processes API requests with monitoring enabled.
        </p>
      </div>
    </div>
  );
}
