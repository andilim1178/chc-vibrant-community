import React, { useState } from 'react';

interface NotesSectionProps {
  visible: boolean;
  notes: string;
  onChange: (text: string) => void;
  elementName: string;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  visible,
  notes,
  onChange,
  elementName
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!visible) {
    return null;
  }

  const arrow = isExpanded ? '▼' : '▶';

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
        {arrow} Notes for {elementName}
      </button>

      {isExpanded && (
        <textarea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onChange(e.target.value)}
          placeholder="Add any relevant notes or context..."
          style={{
            width: '100%',
            minHeight: '80px',
            marginTop: '12px',
            padding: '12px',
            borderRadius: 'var(--radius)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            color: 'inherit',
            fontFamily: 'inherit',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      )}
    </div>
  );
};
