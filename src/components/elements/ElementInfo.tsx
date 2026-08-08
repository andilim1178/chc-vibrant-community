import React from 'react';
import { ElementConfig } from '../../types/placerate';
import { pickInk } from '../../utils/contrast';
import { completionFor } from '../../utils/questionUtils';

interface ElementInfoProps {
  element: ElementConfig;
  answers: Record<string, Record<number, any>> | undefined;
  onStartAssessment: () => void;
  onClose: () => void;
}

// Material Icons for each element type
const ElementIconNames: Record<string, string> = {
  transport: 'directions_bus',
  'publicrealm': 'park',
  'retail': 'shopping_cart',
  education: 'school',
  'health': 'local_hospital',
  sustainable: 'eco',
  'housing': 'apartment',
  'economy': 'work',
  infrastructure: 'electrical_services',
  'vision': 'target',
  'people': 'group',
  'safety': 'security',
  'events': 'celebration',
  'nature': 'park',
  'arts': 'palette',
  'play': 'sports_soccer',
  governance: 'account_balance',
  'aging': 'elderly',
  default: 'help',
};

export const ElementInfo: React.FC<ElementInfoProps> = ({
  element,
  answers,
  onStartAssessment,
  onClose,
}) => {
  const textColor = pickInk(element.color === 'var(--el-default)' ? '#767482' : (element.color || '#767482'));
  const iconName = ElementIconNames[element.id] || ElementIconNames.default;
  const completion = completionFor([element], answers);
  const isComplete = completion.percent === 100;
  const isStarted = completion.answered > 0;
  const assessmentLabel = isComplete ? 'Edit Assessment' : isStarted ? 'Resume Assessment' : 'Start Assessment';

  return (
    <div
      className="element-scope overlay-screen"
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
        // Above the sticky .top-bar (z-index 100), which otherwise clips this.
        zIndex: 200,
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
              fontSize: '24px',
              transition: 'all 200ms ease',
              fontFamily: 'Material Icons',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            arrow_back
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
              fontSize: '20px',
              transition: 'all 200ms ease',
              marginLeft: 'auto',
              fontFamily: 'Material Icons',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            home
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
              fontSize: '120px',
              fontFamily: 'Material Icons',
            }}
          >
            {iconName}
          </div>

          {/* Element Name */}
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 16,
              textTransform: 'capitalize',
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
            {assessmentLabel} →
          </button>
        </div>
      </div>
    </div>
  );
};
