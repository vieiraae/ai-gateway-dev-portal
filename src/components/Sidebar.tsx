import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BrainCircuit,
  Zap,
  Server,
  ArrowLeftRight,
  Package,
  KeyRound,
  Play,
  Activity,
  ScrollText,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

type NavEntry =
  | { type: 'link'; to: string; label: string; Icon: typeof LayoutDashboard }
  | { type: 'divider' };

const navItems: NavEntry[] = [
  { type: 'link', to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { type: 'divider' },
  { type: 'link', to: '/model-providers', label: 'Model providers', Icon: BrainCircuit },
  { type: 'link', to: '/inference-apis', label: 'Inference APIs', Icon: Zap },
  { type: 'link', to: '/mcp-servers', label: 'MCP servers', Icon: Server },
  { type: 'link', to: '/a2a', label: 'A2A', Icon: ArrowLeftRight },
  { type: 'link', to: '/products', label: 'Products', Icon: Package },
  { type: 'link', to: '/subscriptions', label: 'Subscriptions', Icon: KeyRound },
  { type: 'divider' },
  { type: 'link', to: '/playground', label: 'Playground', Icon: Play },
  { type: 'link', to: '/metrics', label: 'Metrics', Icon: Activity },
  { type: 'link', to: '/logs', label: 'Logs', Icon: ScrollText },
  { type: 'link', to: '/analytics', label: 'Analytics', Icon: BarChart3 },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <nav className="sidebar-nav">
        {navItems.map((item, i) =>
          item.type === 'divider' ? (
            <div key={`div-${i.toString()}`} className="sidebar-divider" />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-item${isActive ? ' active' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.Icon className="sidebar-item-icon" />
              <span className="sidebar-item-label">{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>
      <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
      </button>
    </aside>
  );
}
