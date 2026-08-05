import React, { useState } from 'react';

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  selected,
  onClick,
  disabled = false
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const getBackgroundColor = () => {
    if (disabled) {
      return selected ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.15)';
    }

    if (selected) {
      return 'rgba(0, 0, 0, 0.2)';
    }

    if (isHovering) {
      return 'rgba(255, 255, 255, 0.25)';
    }

    return 'rgba(255, 255, 255, 0.15)';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`Option: ${label}${selected ? ', selected' : ''}`}
      aria-pressed={selected}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocus={(e) => {
        const color = window.getComputedStyle(e.currentTarget).color;
        e.currentTarget.style.outline = `2px solid ${color}`;
        e.currentTarget.style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
      style={{
        width: '100%',
        padding: '16px 20px',
        marginBottom: '12px',
        borderRadius: 'var(--radius)',
        border: 'none',
        fontSize: '16px',
        fontWeight: selected ? 600 : 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: getBackgroundColor(),
        opacity: disabled ? 0.5 : 1,
        transition: 'all 200ms ease'
      }}
    >
      {label}
    </button>
  );
};
