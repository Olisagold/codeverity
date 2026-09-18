import React from 'react';

interface SkeletonProps {
  rows?: number;
  className?: string;
}

export function Skeleton({ rows = 5, className = '' }: SkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-11 animate-pulse rounded-lg bg-surface-2" />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}
