import React from 'react';
import type { SeriesPoint } from '@/types/dashboard';

interface ActivityChartProps {
  points: SeriesPoint[];
  metric?: 'requests' | 'assessments';
  height?: number;
}

export function ActivityChart({ points, metric = 'assessments', height = 180 }: ActivityChartProps) {
  const width = 960;
  const values = points.map((point) => point[metric]);
  const max = Math.max(...values) * 1.15;
  const step = points.length > 1 ? width / (points.length - 1) : width;

  const coords = values.map((value, index) => ({
    x: index * step,
    y: height - (value / max) * height,
  }));

  const line = coords.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;

  const gridLines = [0.25, 0.5, 0.75, 1];

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${metric} over time`}
        className="h-44 w-full"
      >
        {gridLines.map((fraction) => (
          <line key={fraction} x1={0} x2={width} y1={height * fraction} y2={height * fraction} stroke="#18181B" strokeWidth={1} />
        ))}
        <path d={area} fill="#3B82F6" fillOpacity={0.08} />
        <path d={line} fill="none" stroke="#3B82F6" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="mt-3 flex justify-between font-mono text-[11px] text-faint">
        {points.map((point, index) =>
          points.length <= 12 || index % Math.ceil(points.length / 8) === 0 ? (
            <span key={point.label}>{point.label}</span>
          ) : null
        )}
      </div>
    </div>
  );
}
