import React, { useState } from 'react';
import { usePlaceRate } from '../../context/PlaceRateContext';

/**
 * Mock sign-in screen for the prototype.
 *
 * Nothing here authenticates: the social buttons sign you straight in, and the
 * email form only checks that the fields look filled in. The password is read
 * from local state to validate length and is never stored, logged or sent
 * anywhere — swap this whole component out when real auth arrives.
 */
/** Official four-colour Google "G", inlined so it needs no network request. */
const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

/** Official Facebook "f" mark in brand blue #1877F2. */
const FacebookMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="#1877F2"
      d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"
    />
  </svg>
);

export const LoginScreen: React.FC = () => {
  const { signIn } = usePlaceRate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setPassword('');
    signIn({ method: 'email', email });
  };

  // Both marks sit on white, which is what Google's and Facebook's sign-in
  // branding guidelines call for and what keeps the logos legible.
  const socialButton: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    padding: '13px 16px',
    marginBottom: 10,
    background: '#FFFFFF',
    border: '1px solid #DADCE0',
    borderRadius: 'var(--radius)',
    color: '#3C4043',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 12px',
    background: 'var(--surface2)',
    border: '1px solid var(--border2)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: 'var(--text-muted)',
    display: 'block',
    marginBottom: 4,
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: '-0.5px',
              color: 'var(--text)',
            }}
          >
            PlaceRate
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
            Vibrant Communities
          </div>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 20,
            marginBottom: 18,
            textAlign: 'center',
            color: 'var(--text)',
          }}
        >
          Sign in
        </h2>

        <button
          type="button"
          style={socialButton}
          onClick={() => signIn({ method: 'google' })}
          onMouseEnter={e => { e.currentTarget.style.background = '#F7F8F8'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
        >
          <GoogleMark />
          Continue with Google
        </button>

        <button
          type="button"
          style={socialButton}
          onClick={() => signIn({ method: 'facebook' })}
          onMouseEnter={e => { e.currentTarget.style.background = '#F7F8F8'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
        >
          <FacebookMark />
          Continue with Facebook
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            margin: '18px 0',
            color: 'var(--text-dim)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          <span style={{ flex: 1, height: 1, background: 'var(--border2)' }} />
          or
          <span style={{ flex: 1, height: 1, background: 'var(--border2)' }} />
        </div>

        <form onSubmit={handleEmailSubmit} noValidate>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle} htmlFor="login-email">EMAIL</label>
            <input
              id="login-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={fieldStyle}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle} htmlFor="login-password">PASSWORD</label>
            <input
              id="login-password"
              type="password"
              autoComplete="off"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              style={fieldStyle}
            />
          </div>

          {error && (
            <div role="alert" style={{ fontSize: 12, color: '#B3261E', marginBottom: 12 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '13px',
              background: 'var(--accent)',
              color: 'var(--accent-text)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign in with email
          </button>
        </form>

        <p
          style={{
            marginTop: 18,
            fontSize: 11,
            lineHeight: 1.5,
            color: 'var(--text-dim)',
            textAlign: 'center',
          }}
        >
          Demo sign-in. Credentials are not checked, sent or stored.
        </p>
      </div>
    </div>
  );
};
