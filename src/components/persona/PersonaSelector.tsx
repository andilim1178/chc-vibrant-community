import React from 'react';
import { usePlaceRate } from '../../context/PlaceRateContext';

export const PersonaSelector: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { template, setPersona, persona } = usePlaceRate();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(43, 42, 56, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // Above the sticky .top-bar (z-index 100) and the element overlays (200).
      zIndex: 300,
      padding: 20
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: 30,
        maxWidth: 700,
        width: '100%'
      }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 24, marginBottom: 8, textAlign: 'center', color: 'var(--text)' }}>
          Select Your Persona
        </h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 24 }}>
          Choose how you will assess and view place vibrancy metrics.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {Object.entries(template.personas).map(([key, p]) => (
            <div
              key={key}
              onClick={() => {
                setPersona(key);
                onClose();
              }}
              style={{
                background: persona === key ? 'var(--surface3)' : 'var(--surface2)',
                border: `1px solid ${persona === key ? p.color : 'var(--border2)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: 20,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 10, fontFamily: 'Material Icons', color: 'var(--text)' }}>{p.icon}</div>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16, marginBottom: 6, color: 'var(--text)' }}>
                {p.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
