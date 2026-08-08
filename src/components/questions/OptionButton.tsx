import React, { useState } from 'react';
import { lighten, pickInk } from '../../utils/contrast';

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  /** Light tint of the element's colour — the button's resting background. */
  tint: string;
  /** The element's own colour — the resting text colour and the selected fill. */
  ink: string;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  selected,
  onClick,
  disabled = false,
  tint,
  ink,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  // Resting is dark, selected is light — but resting can't be full ink, or it
  // would match the card behind it exactly and the button would disappear.
  const restingFill = lighten(ink, 0.15);
  const hoverFill = lighten(ink, 0.3);
  const backgroundColor = selected ? tint : !disabled && isHovering ? hoverFill : restingFill;
  const color = selected ? ink : pickInk(backgroundColor);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`Option: ${label}${selected ? ', selected' : ''}`}
      aria-pressed={selected}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocus={(e) => {
        e.currentTarget.style.outline = `2px solid ${ink}`;
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
        backgroundColor,
        color,
        opacity: disabled ? 0.5 : 1,
        transition: 'all 200ms ease',
      }}
    >
      {label}
    </button>
  );
};
