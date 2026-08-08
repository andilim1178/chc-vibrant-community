import React, { useEffect, useState } from 'react';
import { usePlaceRate } from '../../context/PlaceRateContext';

interface SettingsPageProps {
  onOpenPersona: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenPersona }) => {
  const { account, activePersonaConfig, updateAccount, signOut, goBackFromSettings } = usePlaceRate();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(account?.firstName || '');
  const [lastName, setLastName] = useState(account?.lastName || '');
  const [email, setEmail] = useState(account?.email || '');
  const [phone, setPhone] = useState(account?.phone || '');

  // Keep the fields in sync if the account changes elsewhere (e.g. re-sign-in).
  useEffect(() => {
    setFirstName(account?.firstName || '');
    setLastName(account?.lastName || '');
    setEmail(account?.email || '');
    setPhone(account?.phone || '');
  }, [account]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAccount({ firstName, lastName, email, phone });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFirstName(account?.firstName || '');
    setLastName(account?.lastName || '');
    setEmail(account?.email || '');
    setPhone(account?.phone || '');
    setIsEditing(false);
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

  const details = [
    { label: 'First Name', value: firstName || 'Not set' },
    { label: 'Last Name', value: lastName || 'Not set' },
    { label: 'Email', value: email || 'Not set' },
    { label: 'Phone Number', value: phone || 'Not set' },
  ];

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
        }}
      >
        <div className="home-head" style={{ marginBottom: 20 }}>
          <button
            className="home-head-button"
            onClick={goBackFromSettings}
            aria-label="Back"
            style={{ fontFamily: 'Material Icons', fontSize: '20px' }}
          >
            arrow_back
          </button>
          <div className="home-head-title" style={{ fontFamily: 'var(--font-head)', fontSize: 20, color: 'var(--text)' }}>
            Settings
          </div>
        </div>

        {/* Persona */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            background: 'var(--surface2)',
            borderRadius: 'var(--radius)',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'Material Icons', fontSize: 28, color: 'var(--text)' }}>
              {activePersonaConfig.icon}
            </span>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Persona</div>
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>{activePersonaConfig.label}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenPersona}
            style={{
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 600,
              background: 'transparent',
              border: '1px solid var(--border2)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            Change
          </button>
        </div>

        {/* Details: read-only view, or an edit form */}
        {isEditing ? (
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle} htmlFor="settings-first-name">FIRST NAME</label>
              <input
                id="settings-first-name"
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="First name"
                style={fieldStyle}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle} htmlFor="settings-last-name">LAST NAME</label>
              <input
                id="settings-last-name"
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Last name"
                style={fieldStyle}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle} htmlFor="settings-email">EMAIL</label>
              <input
                id="settings-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={fieldStyle}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle} htmlFor="settings-phone">PHONE NUMBER</label>
              <input
                id="settings-phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Your phone number"
                style={fieldStyle}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="submit"
                style={{
                  padding: '11px 20px',
                  background: 'var(--accent)',
                  color: 'var(--accent-text)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '11px 20px',
                  background: 'transparent',
                  border: '1px solid var(--border2)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            {details.map(d => (
              <div key={d.label} style={{ marginBottom: 14 }}>
                <span style={labelStyle}>{d.label.toUpperCase()}</span>
                <div style={{ fontSize: 14, color: 'var(--text)' }}>{d.value}</div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{
                marginTop: 8,
                padding: '11px 20px',
                background: 'var(--accent)',
                color: 'var(--accent-text)',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
          </div>
        )}

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={signOut}
            style={{
              width: '100%',
              padding: '11px',
              background: 'transparent',
              border: '1px solid #ef4444',
              borderRadius: 'var(--radius)',
              color: '#ef4444',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
