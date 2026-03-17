import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/msal';
import { LogIn, Terminal, Copy, Check } from 'lucide-react';
import { useTokenAuth } from '../context/TokenAuthContext';

export default function LoginPage() {
  const { instance } = useMsal();
  const { signIn } = useTokenAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [tokenValue, setTokenValue] = useState('');
  const [cmdCopied, setCmdCopied] = useState(false);

  const handleLogin = () => void (async () => {
    setSigningIn(true);
    setError(null);
    try {
      await instance.loginRedirect(loginRequest);
    } catch (err) {
      if (err instanceof Error && !err.message.includes('user_cancelled')) {
        setError(err.message);
      }
      setSigningIn(false);
    }
  })();

  const handleTokenLogin = () => {
    const trimmed = tokenValue.trim();
    if (!trimmed) {
      setError('Please paste a valid access token.');
      return;
    }
    setError(null);
    signIn(trimmed);
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <img src="/ai-gateway.svg" alt="" className="login-logo-icon" />
          <h1 className="login-title">AI Gateway Dev Portal</h1>
        </div>
        <p className="login-subtitle">
          Sign in with your Azure credentials to access
          Models, MCP servers, A2A and more.
        </p>
        {error && <p className="login-error">{error}</p>}

        {!showToken ? (
          <>
            <button
              className="login-btn"
              onClick={handleLogin}
              disabled={signingIn}
            >
              {signingIn ? (
                <span className="spinner spinner-sm" />
              ) : (
                <LogIn className="login-btn-icon" />
              )}
              {signingIn ? 'Signing in…' : 'Sign in with SSO'}
            </button>
            <button className="login-token-toggle" onClick={() => setShowToken(true)}>
              <Terminal size={14} />
              Sign in with access token
            </button>
          </>
        ) : (
          <div className="login-token-form">
            <div className="login-token-hint">
              Run in a terminal to get your token:
              <span className="login-token-cmd-wrap">
                <code className="login-token-cmd">az account get-access-token --query accessToken -o tsv</code>
                <button
                  className="login-token-cmd-copy"
                  title="Copy command"
                  onClick={() => {
                    void navigator.clipboard.writeText('az account get-access-token --query accessToken -o tsv');
                    setCmdCopied(true);
                    setTimeout(() => setCmdCopied(false), 1500);
                  }}
                >
                  {cmdCopied ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </span>
            </div>
            <textarea
              className="login-token-input"
              placeholder="Paste your Azure access token here…"
              value={tokenValue}
              onChange={(e) => setTokenValue(e.target.value)}
              rows={3}
            />
            <div className="login-token-actions">
              <button className="login-btn" onClick={handleTokenLogin} disabled={!tokenValue.trim()}>
                <Terminal size={16} />
                Sign in
              </button>
              <button className="login-token-back" onClick={() => { setShowToken(false); setError(null); }}>
                Back to sign-in options
              </button>
            </div>
          </div>
        )}

        <p className="login-footer">
          Powered by Azure API Management
        </p>
      </div>
    </div>
  );
}
