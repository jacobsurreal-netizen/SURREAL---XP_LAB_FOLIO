"use client"

import type { ReticlePresentation } from "../Reticle.types"

type LayerProps = {
  intensity: number
  emphasis: number
}

function ReticleGlowField({ intensity }: { intensity: number }) {
  return (
    <>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.10) 0%, rgba(168,85,247,0.05) 28%, rgba(20,0,40,0) 68%)",
          filter: "blur(10px)",
          opacity: intensity * 0.9,
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(240,171,252,0.08) 0%, rgba(240,171,252,0.03) 22%, rgba(0,0,0,0) 55%)",
          filter: "blur(24px)",
          opacity: intensity * 0.7,
        }}
      />
    </>
  )
}

function ReticleRings({ intensity, emphasis }: LayerProps) {
  return (
    <g opacity={0.9 * intensity}>
      <circle
        cx="140"
        cy="140"
        r="88"
        stroke="rgba(168,85,247,0.20)"
        strokeWidth="1.2"
        fill="none"
      />

      <circle
        cx="140"
        cy="140"
        r="74"
        stroke="rgba(168,85,247,0.16)"
        strokeWidth="1"
        fill="none"
        strokeDasharray="4 9"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 140 140"
          to="360 140 140"
          dur="22s"
          repeatCount="indefinite"
        />
      </circle>

      <circle
        cx="140"
        cy="140"
        r="59"
        stroke="rgba(196,90,255,0.18)"
        strokeWidth="0.9"
        fill="none"
        strokeDasharray="2 8"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="360 140 140"
          to="0 140 140"
          dur="18s"
          repeatCount="indefinite"
        />
      </circle>

      <path
        d="M140 81a59 59 0 0 1 41.7 17.3"
        stroke="rgba(228,160,255,0.28)"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M191 140a51 51 0 0 1-14.9 36.1"
        stroke="rgba(228,160,255,0.24)"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M91.5 167.5A54 54 0 0 1 84 140"
        stroke="rgba(228,160,255,0.22)"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />

      <circle
        cx="140"
        cy="140"
        r={20 + emphasis * 2}
        stroke="rgba(216,112,255,0.22)"
        strokeWidth="0.9"
        fill="none"
      >
        <animate
          attributeName="opacity"
          values="0.14;0.32;0.14"
          dur="2.8s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
  )
}

function ReticleTriangle({ intensity }: { intensity: number }) {
  return (
    <g opacity={0.98 * intensity}>
      <polygon
        points="140,52 214,196 66,196"
        stroke="url(#triangleStroke)"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <line x1="140" y1="56" x2="140" y2="102" stroke="rgba(217,70,239,0.14)" strokeWidth="0.9" />

      <path d="M80 196h24" stroke="rgba(240,171,252,0.75)" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M176 196h24" stroke="rgba(240,171,252,0.75)" strokeWidth="1.1" strokeLinecap="round" />

      <path d="M133 52h14" stroke="rgba(240,171,252,0.85)" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M140 45v14" stroke="rgba(240,171,252,0.85)" strokeWidth="1.1" strokeLinecap="round" />

      <path d="M72 187v18" stroke="rgba(240,171,252,0.78)" strokeWidth="1" strokeLinecap="round" />
      <path d="M208 187v18" stroke="rgba(240,171,252,0.78)" strokeWidth="1" strokeLinecap="round" />
      <path d="M64 196h18" stroke="rgba(240,171,252,0.78)" strokeWidth="1" strokeLinecap="round" />
      <path d="M198 196h18" stroke="rgba(240,171,252,0.78)" strokeWidth="1" strokeLinecap="round" />
    </g>
  )
}

function ReticleSweepBeam({ intensity, emphasis }: LayerProps) {
  return (
    <g opacity={Math.min(0.92, 0.72 + emphasis * 0.08) * intensity}>
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="12 140 140"
          to="372 140 140"
          dur="6.5s"
          repeatCount="indefinite"
        />

        <path d="M140 140 L236 112 L202 92 Z" fill="url(#beamGradient)" opacity="0.88" />
        <line x1="140" y1="140" x2="214" y2="114" stroke="rgba(232,170,255,0.95)" strokeWidth="2.1" strokeLinecap="round" />
        <circle cx="214" cy="114" r="3" fill="rgba(217,70,239,0.9)">
          <animate attributeName="opacity" values="0.45;1;0.45" dur="1.6s" repeatCount="indefinite" />
        </circle>
      </g>
    </g>
  )
}

function ReticleCenterLock({ intensity, emphasis }: LayerProps) {
  const ring = 7 + emphasis
  return (
    <g opacity={intensity}>
      <circle cx="140" cy="140" r={ring} fill="rgba(26,0,48,0.7)" stroke="rgba(217,70,239,0.85)" strokeWidth="1.6" />
      <circle cx="140" cy="140" r="2.7" fill="rgba(250,210,255,0.95)" />
      <circle cx="140" cy="140" r="12" stroke="rgba(217,70,239,0.18)" strokeWidth="1" fill="none">
        <animate attributeName="r" values="10;14;10" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.05;0.28;0.05" dur="2.2s" repeatCount="indefinite" />
      </circle>

      <path d="M132 140h-6" stroke="rgba(230,180,255,0.9)" strokeWidth="1" strokeLinecap="round" />
      <path d="M148 140h6" stroke="rgba(230,180,255,0.9)" strokeWidth="1" strokeLinecap="round" />
      <path d="M140 132v-6" stroke="rgba(230,180,255,0.9)" strokeWidth="1" strokeLinecap="round" />
      <path d="M140 148v6" stroke="rgba(230,180,255,0.9)" strokeWidth="1" strokeLinecap="round" />
    </g>
  )
}

function ReticleFocusBrackets({ intensity, emphasis }: LayerProps) {
  const opacity = (0.42 + emphasis * 0.08) * intensity
  return (
    <g opacity={opacity}>
      <path d="M118 104h-9v9" stroke="rgba(230,180,255,0.8)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M162 104h9v9" stroke="rgba(230,180,255,0.8)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M118 176h-9v-9" stroke="rgba(230,180,255,0.8)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M162 176h9v-9" stroke="rgba(230,180,255,0.8)" strokeWidth="1" fill="none" strokeLinecap="round" />

      <path d="M140 94v-6" stroke="rgba(217,70,239,0.48)" strokeWidth="1" strokeLinecap="round" />
      <path d="M140 186v6" stroke="rgba(217,70,239,0.48)" strokeWidth="1" strokeLinecap="round" />
      <path d="M94 140h-6" stroke="rgba(217,70,239,0.48)" strokeWidth="1" strokeLinecap="round" />
      <path d="M186 140h6" stroke="rgba(217,70,239,0.48)" strokeWidth="1" strokeLinecap="round" />
    </g>
  )
}

function ReticleTicks({ intensity }: { intensity: number }) {
  const dots = [
    [86, 72], [106, 58], [174, 74], [194, 108], [208, 174], [174, 202], [140, 214], [106, 202], [72, 174], [60, 108],
  ]

  return (
    <g opacity={0.75 * intensity}>
      {dots.map(([x, y], index) => (
        <circle
          key={`dot-${index}`}
          cx={x}
          cy={y}
          r={index % 3 === 0 ? 2.8 : 1.5}
          fill={index % 3 === 0 ? "rgba(233, 181, 255, 0.7)" : "rgba(168,85,247,0.52)"}
        >
          <animate
            attributeName="opacity"
            values="0.24;0.88;0.24"
            dur={`${2 + (index % 5) * 0.35}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}

      {[
        [72, 118, 72, 128],
        [92, 92, 98, 86],
        [186, 116, 186, 126],
        [164, 192, 170, 198],
        [120, 214, 120, 222],
        [106, 64, 106, 69],
        [196, 166, 202, 169],
      ].map(([x1, y1, x2, y2], index) => (
        <line
          key={`tick-${index}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="rgba(168,85,247,0.55)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      ))}
    </g>
  )
}

function ReticleMicrocopy({ intensity }: { intensity: number }) {
  const style = {
    fontSize: 5.8,
    letterSpacing: 1.7,
    fill: "rgba(215,170,255,0.34)",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
    textTransform: "uppercase" as const,
  }

  return (
    <g opacity={0.9 * intensity}>
      <text x="134" y="86" textAnchor="middle" style={style}>VECTOR</text>
      <text x="94" y="118" textAnchor="middle" style={style}>SCAN</text>
      <text x="186" y="128" textAnchor="middle" style={style}>AXIS 03</text>
      <text x="193" y="180" textAnchor="middle" style={style}>LOCK</text>
      <text x="140" y="206" textAnchor="middle" style={style}>NODE SIG</text>
      <text x="107" y="189" textAnchor="middle" style={style}>Δ 0.73</text>
    </g>
  )
}

export function ReticleScan({
  presentation,
}: {
  presentation: ReticlePresentation
}) {
  const intensity = presentation.intensity
  const state = presentation.state

  const emphasis =
    state === "CTA" ? 1.2 :
    state === "ACTIVE" ? 1 :
    state === "FOCUS" ? 0.85 :
    state === "HOVER" ? 0.7 :
    state === "GATEWAY" ? 1.1 :
    0.55

  const shellOpacity = Math.min(1, 0.72 + intensity * 0.28)

  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center justify-center"
      style={{
        transform: `translate3d(${presentation.motionX}px, ${presentation.motionY}px, 0) scale(${presentation.motionScale + intensity * 0.012})`,
        transformOrigin: "50% 50%",
        transition:
          "transform 160ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 180ms ease-out",
        willChange: "transform",
        opacity: shellOpacity,
      }}
    >
      <div className="relative h-[280px] w-[280px]">
        <ReticleGlowField intensity={intensity} />

        <svg
          width="280"
          height="280"
          viewBox="0 0 280 280"
          className="absolute inset-0"
          style={{
            overflow: "visible",
            filter: "drop-shadow(0 0 8px rgba(168,85,247,0.65)) drop-shadow(0 0 18px rgba(192,132,252,0.18))",
          }}
        >
          <defs>
            <linearGradient id="triangleStroke" x1="66" y1="196" x2="214" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(217,70,239,0.95)" />
              <stop offset="55%" stopColor="rgba(196,90,255,0.92)" />
              <stop offset="100%" stopColor="rgba(232,170,255,0.95)" />
            </linearGradient>
            <linearGradient id="beamGradient" x1="140" y1="140" x2="236" y2="112" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(217,70,239,0.00)" />
              <stop offset="40%" stopColor="rgba(217,70,239,0.20)" />
              <stop offset="100%" stopColor="rgba(232,170,255,0.42)" />
            </linearGradient>
          </defs>

          <ReticleRings intensity={intensity} emphasis={emphasis} />
          <ReticleSweepBeam intensity={intensity} emphasis={emphasis} />
          <ReticleTriangle intensity={intensity} />
          <ReticleFocusBrackets intensity={intensity} emphasis={emphasis} />
          <ReticleTicks intensity={intensity} />
          <ReticleMicrocopy intensity={intensity} />
          <ReticleCenterLock intensity={intensity} emphasis={emphasis} />
        </svg>
      </div>
    </div>
  )
}
