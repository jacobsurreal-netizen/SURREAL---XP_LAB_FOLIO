"use client"

import type { ReticlePresentation } from "../Reticle.types"

const ACCENT = "#00f0d4"
const ACCENT_SOFT = "rgba(0, 240, 212, 0.28)"
const INK = "rgba(190, 255, 244, 0.9)"

type Props = {
  presentation: ReticlePresentation
}

export function ReticleColor({ presentation }: Props) {
  const intensity = presentation.intensity
  const state = presentation.state

  const scaleBoost =
    state === "CTA" ? 0.02 : state === "ACTIVE" ? 0.016 : state === "FOCUS" ? 0.012 : 0.008

  const glowStrength =
    state === "CTA" ? 12 : state === "ACTIVE" ? 10 : state === "FOCUS" ? 8 : 6

  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center justify-center"
      style={{
        transform: `translate3d(${presentation.motionX}px, ${presentation.motionY}px, 0) scale(${presentation.motionScale + intensity * scaleBoost})`,
        transformOrigin: "50% 50%",
        transition:
          "transform 160ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 180ms ease-out",
        willChange: "transform",
      }}
    >
      <svg
        width="240"
        height="240"
        viewBox="0 0 240 240"
        style={{
          opacity: intensity,
          filter: `drop-shadow(0 0 ${glowStrength}px ${ACCENT})`,
        }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="reticle-color-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,240,212,0.14)" />
            <stop offset="65%" stopColor="rgba(0,240,212,0.04)" />
            <stop offset="100%" stopColor="rgba(0,240,212,0)" />
          </radialGradient>
        </defs>

        <ReticleGlowField />
        <ReticleOuterRings />
        <ReticleTriangleFrame />
        <ReticleFocusBrackets />
        <ReticleAxisLines />
        <ReticleCenterLock />
        <ReticleMarkerDots />
      </svg>
    </div>
  )
}

function ReticleGlowField() {
  return <circle cx="120" cy="120" r="72" fill="url(#reticle-color-core)" opacity="0.85" />
}

function ReticleOuterRings() {
  return (
    <>
      <circle
        cx="120"
        cy="120"
        r="84"
        stroke={ACCENT}
        strokeWidth="1.35"
        fill="none"
        opacity="0.16"
      />
      <circle
        cx="120"
        cy="120"
        r="84"
        stroke={ACCENT}
        strokeWidth="1.8"
        fill="none"
        strokeDasharray="34 18"
        opacity="0.34"
      />
      <circle
        cx="120"
        cy="120"
        r="56"
        stroke={ACCENT}
        strokeWidth="1"
        fill="none"
        strokeDasharray="7 11"
        opacity="0.16"
      />
    </>
  )
}

function ReticleTriangleFrame() {
  return (
    <>
      <polygon
        points="120,62 169,153 71,153"
        stroke={ACCENT}
        strokeWidth="1.8"
        fill="none"
        opacity="0.88"
      />
      <polygon
        points="120,82 153,146 87,146"
        stroke={ACCENT}
        strokeWidth="1"
        fill="none"
        opacity="0.28"
      />

      <line x1="120" y1="62" x2="120" y2="54" stroke={ACCENT} strokeWidth="1.5" opacity="0.8" />
      <line x1="167" y1="153" x2="176" y2="153" stroke={ACCENT} strokeWidth="1.5" opacity="0.8" />
      <line x1="64" y1="153" x2="73" y2="153" stroke={ACCENT} strokeWidth="1.5" opacity="0.8" />
    </>
  )
}

function ReticleFocusBrackets() {
  return (
    <>
      <path d="M97 104h-10v10" stroke={ACCENT} strokeWidth="1.2" fill="none" opacity="0.52" />
      <path d="M143 104h10v10" stroke={ACCENT} strokeWidth="1.2" fill="none" opacity="0.52" />
      <path d="M97 136h-10v-10" stroke={ACCENT} strokeWidth="1.2" fill="none" opacity="0.52" />
      <path d="M143 136h10v-10" stroke={ACCENT} strokeWidth="1.2" fill="none" opacity="0.52" />
    </>
  )
}

function ReticleAxisLines() {
  return (
    <>
      <line x1="120" y1="34" x2="120" y2="206" stroke={ACCENT} strokeWidth="1" opacity="0.16" />
      <line x1="34" y1="120" x2="206" y2="120" stroke={ACCENT} strokeWidth="1" opacity="0.12" />

      <line x1="92" y1="120" x2="104" y2="120" stroke={ACCENT} strokeWidth="1" opacity="0.55" />
      <line x1="136" y1="120" x2="148" y2="120" stroke={ACCENT} strokeWidth="1" opacity="0.55" />
      <line x1="120" y1="92" x2="120" y2="104" stroke={ACCENT} strokeWidth="1" opacity="0.55" />
      <line x1="120" y1="136" x2="120" y2="148" stroke={ACCENT} strokeWidth="1" opacity="0.55" />
    </>
  )
}

function ReticleCenterLock() {
  return (
    <>
      <circle cx="120" cy="120" r="13" stroke={ACCENT} strokeWidth="1.1" fill="none" opacity="0.26" />
      <circle cx="120" cy="120" r="5" stroke={ACCENT} strokeWidth="1.3" fill="none" opacity="0.84" />
      <circle cx="120" cy="120" r="2" fill={ACCENT} opacity="0.95" />
      <circle cx="120" cy="120" r="1" fill={INK} opacity="0.95" />
    </>
  )
}

function ReticleMarkerDots() {
  const points = [
    [120, 76],
    [158, 98],
    [162, 144],
    [120, 168],
    [78, 144],
    [82, 98],
  ] as const

  return (
    <>
      {points.map(([cx, cy], index) => (
        <circle
          key={`${cx}-${cy}-${index}`}
          cx={cx}
          cy={cy}
          r={index % 2 === 0 ? "1.8" : "1.4"}
          fill={ACCENT}
          opacity={index % 2 === 0 ? "0.6" : "0.35"}
        />
      ))}

      <circle cx="120" cy="56" r="1.4" fill={INK} opacity="0.75" />
      <circle cx="176" cy="153" r="1.4" fill={INK} opacity="0.75" />
      <circle cx="64" cy="153" r="1.4" fill={INK} opacity="0.75" />

      <path d="M120 56l3-5" stroke={ACCENT_SOFT} strokeWidth="1" />
      <path d="M176 153l5 0" stroke={ACCENT_SOFT} strokeWidth="1" />
      <path d="M59 153l5 0" stroke={ACCENT_SOFT} strokeWidth="1" />
    </>
  )
}
