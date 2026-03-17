import SearchBar from './SearchBar';
import WorkspaceSelector from './WorkspaceSelector';
import UserMenu from './UserMenu';
import { FlaskConical } from 'lucide-react';

export default function Header() {

  return (
    <header className="header">
      {/* Left: Logo + Workspace */}
      <div className="header-left">
        <a href="/" className="header-logo-link">
          <img
            src="/ai-gateway.svg"
            alt="AI Gateway"
            className="header-logo-icon"
          />
          <span className="header-logo-text">AI Gateway</span>
        </a>
        <div className="header-separator" />
        <WorkspaceSelector />
      </div>

      {/* Center: Search */}
      <div className="header-center">
        <SearchBar />
      </div>

      {/* Right: Actions + User */}
      <div className="header-right">
        <a href="https://aka.ms/ai-gateway/labs" target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="Labs" title="Labs">
          <FlaskConical size={16} />
        </a>
        <UserMenu />
      </div>
    </header>
  );
}
