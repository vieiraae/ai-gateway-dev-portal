import { LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Overview of your AI Gateway resources, usage metrics, and health status.
        </p>
      </div>
      <div className="page-empty">
        <LayoutDashboard className="page-empty-icon" />
        <div className="page-empty-title">Dashboard</div>
        <p className="page-empty-text">
          Select an Azure Subscription and API Management workspace to view your dashboard.
        </p>
      </div>
    </div>
  );
}
