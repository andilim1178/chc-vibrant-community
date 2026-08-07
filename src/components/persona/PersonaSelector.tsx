import React from 'react';
import { usePlaceRate } from '../../context/PlaceRateContext';

export const PersonaSelector: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { template, setPersona, persona } = usePlaceRate();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.88)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 300,
      padding: 20
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-xl)',
        padding: 40,
        maxWidth: 700,
        width: '100%'
      }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 42, fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1, textTransform: 'uppercase', marginBottom: 10, color: 'var(--text)' }}>
          Select your persona
        </h2>
        <p style={{ fontFamily: 'var(--font-slab)', fontSize: 16, color: 'var(--text-muted)', marginBottom: 28, maxWidth: 420 }}>
          Choose how you will assess and view place vibrancy metrics.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1, background: 'var(--border-strong)', border: '1px solid var(--border-strong)' }}>
          {Object.entries(template.personas).map(([key, p]) => {
            const selected = persona === key;
            return (
              <div
                key={key}
                onClick={() => {
                  setPersona(key);
                  onClose();
                }}
                style={{
                  background: selected ? 'var(--cyan)' : 'var(--surface)',
                  borderRadius: 0,
                  padding: '28px 20px',
                  cursor: 'pointer',
                  transition: 'background 150ms ease'
                }}
                onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'var(--surface2)'; }}
                onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'var(--surface)'; }}
              >
                <div style={{ fontSize: 44, marginBottom: 14, fontFamily: 'Material Icons', color: 'var(--text)' }}>{p.icon}</div>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: 17, letterSpacing: '-0.02em', textTransform: 'uppercase', marginBottom: 6, color: 'var(--text)' }}>
                  {p.label}
                </div>
                <div style={{ fontFamily: 'var(--font-slab)', fontSize: 13, lineHeight: 1.35, color: selected ? 'var(--text)' : 'var(--text-muted)' }}>{p.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
