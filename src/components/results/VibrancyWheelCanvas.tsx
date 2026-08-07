import React, { useEffect, useRef } from 'react';
import { usePlaceRate } from '../../context/PlaceRateContext';
import { calculateProjectScore } from '../../utils/scoring';

interface VibrancyWheelCanvasProps {
  size?: number;
}

export const VibrancyWheelCanvas: React.FC<VibrancyWheelCanvasProps> = ({ size = 200 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { activeProject, template } = usePlaceRate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeProject) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = (size / 2) * 0.85;

    // Clear canvas
    ctx.fillStyle = 'var(--surface2)';
    ctx.fillRect(0, 0, size, size);

    const hardElements = template.elements.filter(e => e.type === 'hard');
    const softElements = template.elements.filter(e => e.type === 'soft');
    const allElements = [...hardElements, ...softElements];

    const totalScore = calculateProjectScore(activeProject);

    // Draw segments
    allElements.forEach((element, index) => {
      const angle = (index / allElements.length) * Math.PI * 2 - Math.PI / 2;
      const nextAngle = ((index + 1) / allElements.length) * Math.PI * 2 - Math.PI / 2;

      const score = activeProject.scores?.[element.id] || 0;
      const percentage = element.maxPoints > 0 ? score / element.maxPoints : 0;
      const radius = percentage * maxRadius;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, nextAngle);
      ctx.closePath();

      const hex = element.color || '#767482';
      ctx.fillStyle = hex;
      ctx.fill();

      // Draw segment border
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw circles
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (maxRadius / 4) * i, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw center circle
    ctx.fillStyle = 'var(--surface)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Draw center text
    ctx.fillStyle = 'var(--text)';
    // Canvas can't read CSS vars — the element font is named directly here.
    ctx.font = `600 ${size * 0.12}px Poppins, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(totalScore.toString(), centerX, centerY);
  }, [size, activeProject, template]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        borderRadius: '50%',
        background: 'var(--surface2)',
      }}
    />
  );
};
