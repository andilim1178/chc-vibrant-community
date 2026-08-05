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

  'publicrealm': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="60" width="120" height="80" fill="none" stroke="currentColor" stroke-width="2" rx="5"/>
    <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 100 70 L 85 85 M 100 70 L 115 85 M 85 85 L 100 100 M 115 85 L 100 100" stroke="currentColor" stroke-width="1.5"/>
    <path d="M 70 150 Q 70 160 80 160 Q 90 160 90 150" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 110 150 Q 110 160 120 160 Q 130 160 130 150" fill="none" stroke="currentColor" stroke-width="2"/>
  </svg>`,

  'retail': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="50" y="70" width="100" height="80" fill="none" stroke="currentColor" stroke-width="2" rx="5"/>
    <line x1="100" y1="70" x2="100" y2="150" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="75" cy="95" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="125" cy="95" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
    <rect x="60" y="110" width="80" height="10" fill="currentColor" opacity="0.2"/>
    <path d="M 70 70 L 65 50 L 135 50 L 130 70" fill="none" stroke="currentColor" stroke-width="2"/>
  </svg>`,

  education: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M 60 130 L 100 70 L 140 130" fill="none" stroke="currentColor" stroke-width="2"/>
    <rect x="75" y="85" width="50" height="35" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="85" y1="95" x2="115" y2="95" stroke="currentColor" stroke-width="1.5"/>
    <line x1="85" y1="105" x2="115" y2="105" stroke="currentColor" stroke-width="1.5"/>
    <line x1="85" y1="115" x2="115" y2="115" stroke="currentColor" stroke-width="1.5"/>
    <line x1="100" y1="130" x2="100" y2="150" stroke="currentColor" stroke-width="2"/>
  </svg>`,

  'health': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 100 70 L 100 130 M 70 100 L 130 100" stroke="currentColor" stroke-width="3"/>
    <circle cx="75" cy="75" r="8" fill="currentColor" opacity="0.4"/>
    <circle cx="125" cy="125" r="8" fill="currentColor" opacity="0.4"/>
  </svg>`,

  sustainable: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M 100 50 Q 120 70 120 95 Q 120 130 100 150 Q 80 130 80 95 Q 80 70 100 50" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 90 90 Q 95 85 100 88 Q 105 85 110 90" fill="currentColor" opacity="0.3"/>
    <path d="M 85 105 Q 95 100 100 105 Q 105 100 115 105" fill="currentColor" opacity="0.3"/>
    <circle cx="100" cy="125" r="6" fill="currentColor" opacity="0.4"/>
  </svg>`,

  'housing': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="100" width="50" height="50" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 40 100 L 65 70 L 90 100" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="65" y1="100" x2="65" y2="130" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="50" cy="115" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="110" y="95" width="50" height="55" fill="none" stroke="currentColor" stroke-width="2"/>
    <rect x="120" y="110" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="140" y="110" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,

  'economy': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="70" cy="80" r="15" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 55 95 Q 55 110 70 110 Q 85 110 85 95" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="130" cy="80" r="15" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 115 95 Q 115 110 130 110 Q 145 110 145 95" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 70 110 L 70 140 M 130 110 L 130 140" stroke="currentColor" stroke-width="2"/>
    <path d="M 65 140 L 135 140" stroke="currentColor" stroke-width="2.5"/>
  </svg>`,

  infrastructure: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="60" y="80" width="80" height="60" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="80" y1="80" x2="80" y2="140" stroke="currentColor" stroke-width="2"/>
    <line x1="100" y1="80" x2="100" y2="140" stroke="currentColor" stroke-width="2"/>
    <line x1="120" y1="80" x2="120" y2="140" stroke="currentColor" stroke-width="2"/>
    <circle cx="70" cy="50" r="12" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 70 50 L 75 75" stroke="currentColor" stroke-width="2"/>
    <circle cx="130" cy="50" r="12" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 130 50 L 125 75" stroke="currentColor" stroke-width="2"/>
  </svg>`,

  'vision': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="90" r="25" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="100" cy="90" r="15" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="100" cy="90" r="5" fill="currentColor" opacity="0.5"/>
    <path d="M 60 140 L 140 140 Q 140 160 100 160 Q 60 160 60 140" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="75" cy="155" r="3" fill="currentColor" opacity="0.3"/>
    <circle cx="100" cy="155" r="3" fill="currentColor" opacity="0.3"/>
    <circle cx="125" cy="155" r="3" fill="currentColor" opacity="0.3"/>
  </svg>`,

  'people': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="70" cy="60" r="15" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 55 75 Q 55 85 70 85 Q 85 85 85 75" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="130" cy="60" r="15" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 115 75 Q 115 85 130 85 Q 145 85 145 75" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="100" cy="115" r="15" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 85 130 Q 85 140 100 140 Q 115 140 115 130" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 70 85 L 100 115 M 130 85 L 100 115" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,

  'safety': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M 100 50 L 140 70 L 140 110 Q 140 140 100 155 Q 60 140 60 110 L 60 70 Z" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 85 105 L 95 115 L 125 85" fill="none" stroke="currentColor" stroke-width="2.5"/>
  </svg>`,

  'events': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 100 50 L 85 75 L 95 75 L 90 95 L 110 95 L 105 75 L 115 75 Z" fill="currentColor" opacity="0.3"/>
    <path d="M 70 110 Q 65 100 75 95" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 130 110 Q 135 100 125 95" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="60" cy="130" r="5" fill="currentColor" opacity="0.3"/>
    <circle cx="100" cy="145" r="5" fill="currentColor" opacity="0.3"/>
    <circle cx="140" cy="130" r="5" fill="currentColor" opacity="0.3"/>
  </svg>`,

  'nature': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M 100 50 Q 90 70 100 85 Q 110 70 100 50" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 85 70 Q 75 80 85 95 Q 95 80 85 70" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 115 70 Q 125 80 115 95 Q 105 80 115 70" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="100" y1="85" x2="100" y2="150" stroke="currentColor" stroke-width="3"/>
    <ellipse cx="85" cy="150" rx="12" ry="8" fill="currentColor" opacity="0.3"/>
    <ellipse cx="100" cy="155" rx="15" ry="10" fill="currentColor" opacity="0.3"/>
    <ellipse cx="115" cy="150" rx="12" ry="8" fill="currentColor" opacity="0.3"/>
  </svg>`,

  'arts': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="80" cy="85" r="18" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 70 75 Q 75 70 80 75 Q 85 70 90 75 Q 85 80 80 85 Q 75 80 70 75" fill="currentColor" opacity="0.3"/>
    <rect x="110" y="65" width="60" height="50" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="120" y1="75" x2="160" y2="75" stroke="currentColor" stroke-width="1.5"/>
    <line x1="120" y1="90" x2="160" y2="90" stroke="currentColor" stroke-width="1.5"/>
    <line x1="120" y1="105" x2="160" y2="105" stroke="currentColor" stroke-width="1.5"/>
    <path d="M 80 130 Q 70 120 60 130 Q 70 140 80 140 Q 90 140 100 130 Q 90 120 80 130" fill="none" stroke="currentColor" stroke-width="2"/>
  </svg>`,

  'play': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 100 65 L 115 85 L 100 95 L 85 85 Z" fill="currentColor" opacity="0.4"/>
    <circle cx="75" cy="115" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="125" cy="115" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 75 123 L 75 135 M 125 123 L 125 135" stroke="currentColor" stroke-width="2"/>
  </svg>`,

  governance: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="50" y="60" width="100" height="90" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="50" y1="85" x2="150" y2="85" stroke="currentColor" stroke-width="2"/>
    <circle cx="70" cy="72" r="6" fill="currentColor" opacity="0.3"/>
    <circle cx="100" cy="72" r="6" fill="currentColor" opacity="0.3"/>
    <circle cx="130" cy="72" r="6" fill="currentColor" opacity="0.3"/>
    <rect x="60" y="100" width="25" height="35" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="95" y="100" width="25" height="35" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="130" y="100" width="10" height="35" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,

  'aging': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="70" r="15" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M 100 85 L 100 125" stroke="currentColor" stroke-width="2.5"/>
    <path d="M 80 100 L 120 100" stroke="currentColor" stroke-width="2.5"/>
    <path d="M 85 125 L 100 140 L 115 125" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="100" y1="140" x2="100" y2="155" stroke="currentColor" stroke-width="2"/>
    <circle cx="90" cy="155" r="4" fill="currentColor" opacity="0.4"/>
    <circle cx="110" cy="155" r="4" fill="currentColor" opacity="0.4"/>
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
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 40,
        padding: '40px 24px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: 560,
          width: '100%',
          backgroundColor: element.color === 'var(--el-default)' ? '#767482' : (element.color || '#767482'),
          color: textColor,
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Header with buttons */}
        <div
          style={{
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Back to elements"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: `2px solid ${textColor}`,
              backgroundColor: 'transparent',
              color: textColor,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ←
          </button>

          {/* Home Icon */}
          <button
            onClick={onClose}
            aria-label="Back to elements"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: `2px solid ${textColor}`,
              backgroundColor: 'transparent',
              color: textColor,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              transition: 'all 200ms ease',
              marginLeft: 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            🏠
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '0 24px 24px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
              margin: 0,
            }}
          >
            {element.name}
          </h2>

          {/* Description */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '20px 24px',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 32,
              marginTop: 16,
            }}
          >
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                margin: 0,
                color: textColor,
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
              color: element.color === 'var(--el-default)' ? '#767482' : (element.color || 'var(--surface)'),
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              marginTop: 'auto',
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
      </div>
    </div>
  );
};
