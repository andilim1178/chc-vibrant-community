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

  const socialButton: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    padding: '13px 16px',
    marginBottom: 10,
    background: 'var(--surface2)',
    border: '1px solid var(--border2)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
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
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; }}
        >
          <span aria-hidden="true" style={{ fontFamily: 'Material Icons', fontSize: 18 }}>
            account_circle
          </span>
          Continue with Google
        </button>

        <button
          type="button"
          style={socialButton}
          onClick={() => signIn({ method: 'facebook' })}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; }}
        >
          <span aria-hidden="true" style={{ fontFamily: 'Material Icons', fontSize: 18 }}>
            groups
          </span>
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
