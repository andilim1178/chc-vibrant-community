import React, { useRef, useEffect } from 'react';
import { usePlaceRate } from '../../context/PlaceRateContext';

export const VibrancyWheelCanvas: React.FC<{ size?: number }> = ({ size = 100 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { template, activeProject } = usePlaceRate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = size / 2;
    const cy = size / 2;
    const inner = size * 0.14;
    const outer = size * 0.46;

    ctx.clearRect(0, 0, size, size);

    // Resolve CSS variables once per render
    const root = getComputedStyle(document.documentElement);
    const surfaceColor = root.getPropertyValue('--surface').trim();
    const defaultColor = root.getPropertyValue('--el-default').trim();

    const elements = template.elements;
    const totalEls = elements.length;

    elements.forEach((el, i) => {
      const a1 = (i / totalEls) * Math.PI * 2 - Math.PI / 2;
      const a2 = ((i + 0.82) / totalEls) * Math.PI * 2 - Math.PI / 2;
      
      const sc = activeProject?.scores?.[el.id] !== undefined;
      const score = activeProject?.scores?.[el.id] || 0;
      const pct = el.maxPoints > 0 ? score / el.maxPoints : 0;
      const or = inner + (outer - inner) * (sc ? Math.max(pct, 0.2) : 0.12);

      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a1) * inner, cy + Math.sin(a1) * inner);
      ctx.lineTo(cx + Math.cos(a1) * or, cy + Math.sin(a1) * or);
      ctx.arc(cx, cy, or, a1, a2);
      ctx.lineTo(cx + Math.cos(a2) * inner, cy + Math.sin(a2) * inner);
      ctx.arc(cx, cy, inner, a2, a1, true);
      ctx.closePath();

      // Use element colour if available, else default
      ctx.fillStyle = el.color || defaultColor;
      ctx.globalAlpha = sc ? 0.9 : 0.18;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, inner * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = surfaceColor;
    ctx.fill();
  }, [template, activeProject, size]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};
