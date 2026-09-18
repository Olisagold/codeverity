import React from 'react';

/**
 * Decorative hero backdrop: a perspective "floor" grid receding into the distance,
 * a faint back-wall grid, and a blueprint-style overlay of crosshairs, node squares
 * and a routed path. Pure CSS + inline SVG, no images.
 */
export function HeroBackground() {
  return (
    <div aria-hidden="true" className="hero-bg pointer-events-none absolute inset-0 overflow-hidden">
      {/* Back wall */}
      <div className="hero-bg__wall absolute inset-x-0 top-0 h-[62%]" />

      {/* Perspective floor */}
      <div className="hero-bg__floor-wrap absolute inset-x-0 bottom-0 h-[58%]">
        <div className="hero-bg__floor" />
      </div>

      {/* Blueprint overlay */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <symbol id="hb-cross" viewBox="-8 -8 16 16">
            <path d="M0 -8V8M-8 0H8" stroke="currentColor" strokeWidth="1" />
            <circle r="3.5" stroke="currentColor" strokeWidth="1" />
          </symbol>
          <symbol id="hb-node" viewBox="-5 -5 10 10">
            <rect x="-4.5" y="-4.5" width="9" height="9" stroke="currentColor" strokeWidth="1" fill="#0a0a0b" />
          </symbol>
        </defs>

        {/* Left-side markers */}
        <g className="text-[#3f3f46]">
          <use href="#hb-cross" x="92" y="208" width="16" height="16" />
          <use href="#hb-cross" x="176" y="208" width="16" height="16" />
          <use href="#hb-cross" x="92" y="292" width="16" height="16" />
          <rect x="56" y="170" width="7" height="7" fill="#27272a" />
          <rect x="56" y="256" width="7" height="7" fill="#27272a" />
          <rect x="56" y="340" width="7" height="7" fill="#27272a" />
          <rect x="140" y="256" width="7" height="7" fill="#27272a" />
          <rect x="140" y="340" width="7" height="7" fill="#27272a" />
          <rect x="222" y="90" width="7" height="7" fill="#27272a" />
          <rect x="222" y="170" width="7" height="7" fill="#27272a" />
          <rect x="222" y="256" width="7" height="7" fill="#27272a" />
          <rect x="264" y="128" width="8" height="8" stroke="#3f3f46" strokeWidth="1" />
          <rect x="1018" y="470" width="8" height="8" stroke="#3f3f46" strokeWidth="1" />
        </g>

        {/* Right-side blueprint: light frame */}
        <g stroke="#3f3f46" strokeWidth="1">
          <path d="M1396 88H1480V178H1396Z" />
          <path d="M1312 178H1480V432H1312Z" />
          <path d="M1312 178V612" />
          <path d="M1396 88V520" />
          <path d="M1312 350H1480" />
          <path d="M1312 432H1396" />
          <path d="M1312 520H1396" />
          <path d="M1060 612H1312" />
          <path d="M1230 520V612" />
          <path d="M1146 520V612" />
        </g>

        {/* Right-side blueprint: routed red path */}
        <path
          d="M1440 130L1356 218V302H1440V388L1356 478V520L1272 562H1104"
          stroke="#7f2a22"
          strokeWidth="1.25"
        />

        {/* Grey nodes on frame corners */}
        <g className="text-[#3f3f46]">
          {[
            [1396, 88], [1480, 88], [1480, 178], [1312, 178], [1312, 262], [1480, 262], [1312, 350], [1480, 350],
            [1312, 432], [1396, 432], [1480, 432], [1312, 520], [1396, 520], [1312, 612], [1230, 612], [1146, 612], [1060, 612],
          ].map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x - 4} y={y - 4} width="8" height="8" fill="#27272a" />
          ))}
        </g>

        {/* Red path nodes */}
        <g className="text-[#8b3a30]">
          {[[1356, 218], [1356, 302], [1440, 302], [1440, 388], [1356, 478], [1272, 562], [1188, 562], [1104, 562]].map(([x, y]) => (
            <use key={`${x}-${y}`} href="#hb-node" x={x - 5} y={y - 5} width="10" height="10" />
          ))}
          <use href="#hb-cross" x="1432" y="122" width="16" height="16" />
        </g>
      </svg>

      {/* Vignette so copy stays readable */}
      <div className="hero-bg__vignette absolute inset-0" />
    </div>
  );
}
