import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { OpenAI_PATH, Gemini_PATH, DeepSeek_PATH, Claude_PATH } from '@/components/ui/BrandMarks';

/* ------------------------------------------------------------------ */
/* Geometry (viewBox 720 × 640)                                        */
/* ------------------------------------------------------------------ */

const CX = 360;
const MODELS = [
  { id: 'chatgpt', name: 'ChatGPT', vendor: 'OpenAI', path: OpenAI_PATH, x: 130, score: '8.5' },
  { id: 'gemini', name: 'Gemini', vendor: 'Google', path: Gemini_PATH, x: 360, score: '9.0' },
  { id: 'deepseek', name: 'DeepSeek', vendor: 'DeepSeek', path: DeepSeek_PATH, x: 590, score: '8.8' },
];

const Y = {
  platform: 16,
  cv: 116,
  models: 262,
  claude: 438,
  output: 556,
};
const H = { platform: 52, cv: 68, models: 96, claude: 78, output: 60 };

/** Rounded orthogonal connector: down, across, down. */
function elbow(x1: number, y1: number, x2: number, y2: number, r = 14) {
  if (x1 === x2) return `M${x1} ${y1} V${y2}`;
  const midY = (y1 + y2) / 2;
  const dir = x2 > x1 ? 1 : -1;
  return [
    `M${x1} ${y1}`,
    `V${midY - r}`,
    `Q${x1} ${midY} ${x1 + dir * r} ${midY}`,
    `H${x2 - dir * r}`,
    `Q${x2} ${midY} ${x2} ${midY + r}`,
    `V${y2}`,
  ].join(' ');
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function Wire({ d, flow }: { d: string; flow: 1 | 2 | 3 | 4 }) {
  return (
    <g>
      <path d={d} className="arch-wire" />
      <path d={d} pathLength={100} className={`arch-flow arch-flow-${flow}`} />
    </g>
  );
}

function NodeBox({
  x,
  y,
  w,
  h,
  active,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  active: string;
  children: React.ReactNode;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} className="arch-node" />
      <rect x={x} y={y} width={w} height={h} rx={12} className={`arch-node-active ${active}`} />
      {children}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function Architecture() {
  return (
    <section id="architecture" className="border-b border-line-soft bg-surface">
      <div className="mx-auto max-w-shell px-6 py-24">
        <SectionHeading
          eyebrow="Architecture"
          title="Multiple models. Independent reasoning. One final assessment."
          align="center"
        />

        <Reveal delay={0.05} className="mt-14">
          <div className="arch mx-auto max-w-3xl rounded-2xl border border-line bg-base p-4 sm:p-8">
            <svg
              viewBox="0 0 720 640"
              className="block h-auto w-full"
              role="img"
              aria-label="Request flows from your platform to the Codeverity API, fans out to ChatGPT, Gemini and DeepSeek for independent assessment, converges on Claude for reassessment, and returns validated feedback."
            >
              <defs>
                <clipPath id="arch-logo-clip">
                  <rect x={CX - 26} y={Y.cv + 18} width={52} height={32} />
                </clipPath>
              </defs>

              {/* Wires */}
              <Wire d={elbow(CX, Y.platform + H.platform, CX, Y.cv)} flow={1} />
              {MODELS.map((m) => (
                <Wire key={`in-${m.id}`} d={elbow(CX, Y.cv + H.cv, m.x, Y.models)} flow={2} />
              ))}
              {MODELS.map((m) => (
                <Wire key={`out-${m.id}`} d={elbow(m.x, Y.models + H.models, CX, Y.claude)} flow={3} />
              ))}
              <Wire d={elbow(CX, Y.claude + H.claude, CX, Y.output)} flow={4} />

              {/* Your platform */}
              <NodeBox x={CX - 110} y={Y.platform} w={220} h={H.platform} active="arch-on-1">
                <text x={CX} y={Y.platform + 31} textAnchor="middle" className="arch-label">
                  Your platform
                </text>
              </NodeBox>

              {/* Codeverity API */}
              <NodeBox x={CX - 120} y={Y.cv} w={240} h={H.cv} active="arch-on-2">
                <image
                  href="/icons/logo.png"
                  x={CX - 88}
                  y={Y.cv + 20}
                  width={48}
                  height={28}
                  preserveAspectRatio="xMidYMid meet"
                />
                <text x={CX - 30} y={Y.cv + 30} className="arch-label">
                  Codeverity API
                </text>
                <text x={CX - 30} y={Y.cv + 48} className="arch-caption">
                  normalize · dispatch
                </text>
              </NodeBox>

              {/* Models */}
              {MODELS.map((m, i) => (
                <NodeBox key={m.id} x={m.x - 92} y={Y.models} w={184} h={H.models} active="arch-on-3">
                  {/* logo with progress ring */}
                  <circle cx={m.x - 52} cy={Y.models + 36} r={19} className="arch-ring-track" />
                  <circle
                    cx={m.x - 52}
                    cy={Y.models + 36}
                    r={19}
                    pathLength={100}
                    className="arch-ring"
                    style={{ animationDelay: `${i * 0.35}s` }}
                  />
                  <g transform={`translate(${m.x - 62} ${Y.models + 26}) scale(0.8333)`}>
                    <path d={m.path} className="arch-mark" />
                  </g>
                  <text x={m.x - 22} y={Y.models + 33} className="arch-label">
                    {m.name}
                  </text>
                  <text x={m.x - 22} y={Y.models + 50} className="arch-caption">
                    {m.vendor}
                  </text>
                  <g className="arch-score" style={{ animationDelay: `${i * 0.35}s` }}>
                    <text x={m.x - 76} y={Y.models + 80} className="arch-caption">
                      independent score
                    </text>
                    <text x={m.x + 76} y={Y.models + 80} textAnchor="end" className="arch-score-value">
                      {m.score}
                    </text>
                  </g>
                </NodeBox>
              ))}

              {/* Claude reassessment */}
              <NodeBox x={CX - 170} y={Y.claude} w={340} h={H.claude} active="arch-on-4">
                <g transform={`translate(${CX - 148} ${Y.claude + 26}) scale(1.0833)`}>
                  <path d={Claude_PATH} className="arch-mark arch-mark-claude" />
                </g>
                <text x={CX - 110} y={Y.claude + 31} className="arch-label">
                  Reassessment · Claude
                </text>
                <text x={CX - 110} y={Y.claude + 50} className="arch-caption arch-swap-a">
                  comparing 3 prescriptions to criteria…
                </text>
                <text x={CX - 110} y={Y.claude + 50} className="arch-caption arch-swap-b">
                  consensus reached · confidence 0.92
                </text>
              </NodeBox>

              {/* Output */}
              <NodeBox x={CX - 120} y={Y.output} w={240} h={H.output} active="arch-on-5">
                <text x={CX} y={Y.output + 26} textAnchor="middle" className="arch-label">
                  Validated feedback
                </text>
                <text x={CX} y={Y.output + 45} textAnchor="middle" className="arch-caption arch-accent">
                  score 9.2 · returned over HTTP
                </text>
              </NodeBox>
            </svg>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-xl text-center text-sm leading-relaxed text-muted">
            Three models assess every submission independently. Claude then reassesses their prescriptions against
            your criteria, so one weak answer never becomes the final grade.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
