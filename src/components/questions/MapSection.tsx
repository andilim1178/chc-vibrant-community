import React, { useState } from 'react';

interface MapSectionProps {
  visible: boolean;
  address: string;
  elementName: string;
}

/** Collapsible Google Map centered on the project's address, to help answer proximity questions. */
export const MapSection: React.FC<MapSectionProps> = ({
  visible,
  address,
  elementName
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!visible) {
    return null;
  }

  const arrow = isExpanded ? '▼' : '▶';
  const mapSrc = address
    ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
    : null;

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          marginTop: '24px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          color: 'inherit',
          padding: 0,
          textAlign: 'left',
          textDecoration: 'underline'
        }}
      >
        {arrow} Map for <span style={{ textTransform: 'capitalize' }}>{elementName}</span>
      </button>

      {isExpanded && (
        mapSrc ? (
          <iframe
            title={`Map near ${address}`}
            src={mapSrc}
            width="100%"
            height="220"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{
              marginTop: '12px',
              border: 'none',
              borderRadius: 'var(--radius)',
              display: 'block'
            }}
          />
        ) : (
          <p style={{ marginTop: '12px', fontSize: '13px', opacity: 0.8 }}>
            Add a project address in Setup to see the map here.
          </p>
        )
      )}
    </div>
  );
};
