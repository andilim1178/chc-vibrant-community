import React from 'react';
import { ElementConfig } from '../../types/placerate';
import { pickInk } from '../../utils/contrast';

interface ElementInfoProps {
  element: ElementConfig;
  onStartAssessment: () => void;
  onClose: () => void;
}

// Simple SVG illustrations for each element type
const ElementIllustrations: Record<string, string> = {
  transport: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="150" r="20" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="150" cy="150" r="20" fill="none" stroke="currentColor" stroke-width="2"/>
    <rect x="30" y="80" width="140" height="60" fill="none" stroke="currentColor" stroke-width="2" rx="5"/>
    <path d="M 60 80 L 60 40 L 140 40 L 140 80" fill="none" stroke="currentColor" stroke-width="2"/>
    <rect x="70" y="50" width="20" height="15" fill="currentColor" opacity="0.3"/>
  </svg>`,
  
  publicrealm: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="60" width="120" height="80" fill="none" stroke="currentColor" stroke-width="2" rx="5"/>
    <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 100 70 L 85 85 M 100 70 L 115 85 M 85 85 L 100 100 M 115 85 L 100 100" stroke="currentColor" stroke-width="1.5"/>
    <path d="M 70 150 Q 70 160 80 160 Q 90 160 90 150" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 110 150 Q 110 160 120 160 Q 130 160 130 150" fill="none" stroke="currentColor" stroke-width="2"/>
  </svg>`,
  
  community: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="70" cy="60" r="15" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 55 75 Q 55 85 70 85 Q 85 85 85 75" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="130" cy="60" r="15" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 115 75 Q 115 85 130 85 Q 145 85 145 75" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="100" cy="110" r="15" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 85 125 Q 85 135 100 135 Q 115 135 115 125" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 70 85 L 100 110 M 130 85 L 100 110" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,

  default: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 100 60 L 100 140 M 60 100 L 140 100" stroke="currentColor" stroke-width="2"/>
  </svg>`,
};

export const ElementInfo: React.FC<ElementInfoProps> = ({
  element,
  onStartAssessment,
  onClose,
}) => {
  const textColor = pickInk(element.color === 'var(--el-default)' ? '#767482' : (element.color || '#767482'));
  const illustration = ElementIllustrations[element.id] || ElementIllustrations.default;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: element.color === 'var(--el-default)' ? 'var(--surface)' : (element.color || 'var(--surface)'),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 24,
        zIndex: 999,
        color: textColor,
        overflow: 'auto',
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: `2px solid ${textColor}`,
          backgroundColor: 'transparent',
          color: textColor,
          fontSize: 20,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ←
      </button>

      {/* Home Icon */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: `2px solid ${textColor}`,
          backgroundColor: 'transparent',
          color: textColor,
          fontSize: 20,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        🏠
      </button>

      {/* Content */}
      <div style={{ maxWidth: 400, textAlign: 'center', marginTop: 60 }}>
        {/* Illustration */}
        <div
          style={{
            width: 150,
            height: 150,
            margin: '0 auto 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: textColor,
          }}
          dangerouslySetInnerHTML={{ __html: illustration }}
        />

        {/* Element Name */}
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 16,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {element.name}
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            marginBottom: 32,
            opacity: 0.9,
          }}
        >
          {element.description}
        </p>
      </div>

      {/* Start Assessment Button */}
      <button
        onClick={onStartAssessment}
        style={{
          padding: '14px 32px',
          fontSize: 16,
          fontWeight: 600,
          backgroundColor: textColor,
          color: element.color === 'var(--el-default)' ? 'var(--surface)' : (element.color || 'var(--surface)'),
          border: 'none',
          borderRadius: 'var(--radius-lg)',
          cursor: 'pointer',
          marginBottom: 24,
          transition: 'all 200ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.85';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        Start Assessment →
      </button>
    </div>
  );
};
