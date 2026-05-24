"use client"

import type { ReactNode } from "react"

import type { DirectProtocolPhase, DirectProtocolMode } from "./use-recon-direct-protocol"
import { DECODE_LINES } from "./use-recon-direct-protocol"

const protocolActionBtn =
  "relative border border-[color:var(--hud-accent-dim)] px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-[color:var(--hud-text)] transition hover:bg-[color:var(--hud-accent-dim)] hover:text-[color:var(--hud-accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--hud-accent)]"

function ProtocolCornerBrackets() {
  const cornerClass = "absolute w-2 h-2 text-[color:var(--hud-accent)] opacity-25"

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg className={`${cornerClass} top-0 left-0`} viewBox="0 0 8 8">
        <path d="M0 8 V0 H8" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`${cornerClass} top-0 right-0`} viewBox="0 0 8 8">
        <path d="M8 8 V0 H0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`${cornerClass} bottom-0 left-0`} viewBox="0 0 8 8">
        <path d="M0 0 V8 H8" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`${cornerClass} bottom-0 right-0`} viewBox="0 0 8 8">
        <path d="M8 0 V8 H0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  )
}

function StripPanel({ children }: { children: ReactNode }) {
  return (
    <div
      className="pointer-events-auto relative w-full max-w-md border border-[color:var(--hud-accent-dim)] bg-[#040b0a]/75 px-4 py-3 opacity-90 backdrop-blur-sm"
      style={{ boxShadow: "0 0 24px color-mix(in srgb, var(--hud-glow) 20%, transparent)" }}
    >
      <ProtocolCornerBrackets />
      {children}
    </div>
  )
}

export interface ReconDirectProtocolOverlayProps {
  phase: DirectProtocolPhase
  visitedSectors: [boolean, boolean, boolean]
  sectorLabels: readonly ["OBSERVATION", "ANALYSIS", "GATEWAY"]
  resonanceProgress: number
  decodeStep: number
  onAcknowledge: () => void
  onResonanceHoldStart: () => void
  onResonanceHoldEnd: () => void
  mode?: DirectProtocolMode
  confirmViewport?: () => void
}

export function ReconDirectProtocolOverlay({
  phase,
  visitedSectors,
  sectorLabels,
  resonanceProgress,
  decodeStep,
  onAcknowledge,
  onResonanceHoldStart,
  onResonanceHoldEnd,
  mode,
  confirmViewport,
}: ReconDirectProtocolOverlayProps) {
  if (phase === "idle") return null

  if (phase === "report") {
    return (
      <div
        className="pointer-events-auto fixed inset-0 z-[126] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        aria-label="Direct Observation partial decode report"
      >
        <div
          className="relative w-full max-w-md border border-[color:var(--hud-accent-dim)] bg-[#040b0a]/90 px-5 py-5 opacity-95 backdrop-blur-sm"
          style={{ boxShadow: "0 0 32px color-mix(in srgb, var(--hud-glow) 25%, transparent)" }}
        >
          <ProtocolCornerBrackets />
          <div className="space-y-3 font-mono text-[9px] tracking-[0.18em] text-[color:var(--hud-text-dim)] sm:text-[10px]">
            <p className="text-center text-[color:var(--hud-accent)] opacity-90">
              [ PARTIAL DECODE AVAILABLE ]
            </p>
            <div className="space-y-1.5 border-t border-[color:var(--hud-accent-dim)] pt-3 opacity-80">
              <div className="flex justify-between gap-4">
                <span className="shrink-0">SUBJECT CLASS</span>
                <span className="text-right text-[color:var(--hud-accent)]">TRANSDIMENSIONAL ARTIFACT</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>STATE</span>
                <span className="text-right text-[color:var(--hud-accent)]">
                  DORMANT / PARTIALLY RESPONSIVE
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>ORIGIN VECTOR</span>
                <span className="text-[color:var(--hud-accent)]">TOKEN-LOCKED</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="shrink-0">FUNCTION TRACE</span>
                <span className="text-right text-[color:var(--hud-accent)]">
                  INTERFACE / BRIDGE / ANCHOR
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>RESONANCE KEY</span>
                <span className="tabular-nums text-[color:var(--hud-accent)]">F#4 // 370Hz</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="shrink-0">RECOMMENDED ACTION</span>
                <span className="text-right text-[color:var(--hud-accent)]">
                  PHYSICAL TOKEN ALIGNMENT
                </span>
              </div>
            </div>
            <p className="pt-1 text-center text-[8px] leading-relaxed tracking-[0.14em] opacity-50">
              SINGLE VIEWPOINT INSUFFICIENT — DESKTOP OBSERVATION RETURNS PARTIAL DATA ONLY
            </p>
          </div>
          <div className="mt-4 flex justify-center">
            <button type="button" onClick={onAcknowledge} className={protocolActionBtn}>
              &gt; ACKNOWLEDGE_REPORT
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Default to desktop when mode not provided
  const currentMode = mode ?? "desktop"

  // Render calibrate UI for mobile mode when phase === "calibrate"
  if (phase === "calibrate") {
    return (
      <div
        className="pointer-events-auto fixed inset-0 z-[126] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Direct Observation Calibrate"
      >
        <div
          className="relative w-full max-w-xs border border-[color:var(--hud-accent-dim)] bg-[#040b0a]/90 px-4 py-5 opacity-95 backdrop-blur-sm"
          style={{ boxShadow: "0 0 24px color-mix(in srgb, var(--hud-glow) 20%, transparent)" }}
        >
          <ProtocolCornerBrackets />
          <div className="space-y-3 font-mono text-[9px] tracking-[0.18em] text-[color:var(--hud-text-dim)] sm:text-[10px]">
            <p className="text-center text-[color:var(--hud-accent)] opacity-90">[ MOBILE DIRECT OBSERVATION ]</p>
            <div className="space-y-1.5 border-t border-[color:var(--hud-accent-dim)] pt-3 opacity-80">
              <div className="text-center">CALIBRATE VIEWPORT</div>
              <div className="text-center opacity-70">COMPACT PROBE MODE</div>
              <div className="text-center opacity-60">VIEWPORT LOCK: <span className="text-[color:var(--hud-accent)]">ACTIVE</span></div>
              <div className="text-center opacity-60">SINGLE VIEWPOINT — PARTIAL DATA ONLY</div>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => confirmViewport && confirmViewport()}
              className={protocolActionBtn}
            >
              &gt; CONFIRM_VIEWPORT
            </button>
          </div>
        </div>
      </div>
    )
  }

  const progressPct = Math.round(resonanceProgress * 100)
  const decodeLine = DECODE_LINES[Math.min(decodeStep, DECODE_LINES.length - 1)]

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[18vh] z-[125] flex translate-y-1 justify-center px-4 md:bottom-[22vh]"
      role="region"
      aria-label="Direct Observation Protocol"
      aria-live="polite"
    >
      <StripPanel>
        {phase === "viewpoints" && (
          <div className="space-y-2 font-mono text-[9px] tracking-[0.2em] text-[color:var(--hud-text-dim)] sm:text-[10px]">
            <p className="text-center text-[color:var(--hud-accent)] opacity-80">
              [ DIRECT OBSERVATION PROTOCOL ]
            </p>
            <p className="text-center opacity-70">VIEWPOINT SET</p>
            <ul className="space-y-1 pt-1">
              {sectorLabels.map((label, index) => (
                <li key={label} className="flex justify-between gap-4">
                  <span>{label}</span>
                  <span
                    className={
                      visitedSectors[index]
                        ? "text-[color:var(--hud-accent)] opacity-80"
                        : "opacity-40"
                    }
                  >
                    {visitedSectors[index] ? "LOCKED" : "PENDING"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="pt-1 text-center text-[8px] tracking-[0.16em] opacity-45">
              SCROLL THROUGH OBSERVATION ANGLES
            </p>
          </div>
        )}

        {phase === "resonance" && (
          <div className="space-y-3 font-mono text-[9px] tracking-[0.2em] text-[color:var(--hud-text-dim)] sm:text-[10px]">
            <p className="text-center text-[color:var(--hud-accent)] opacity-80">
              [ RESONANCE STABILIZATION ]
            </p>
            <p className="text-center text-[color:var(--hud-accent)] opacity-60">F#4 // 370Hz</p>
            <div className="relative h-px w-full overflow-hidden bg-[color:var(--hud-accent-dim)]">
              <div
                className="absolute inset-y-0 left-0 bg-[color:var(--hud-accent)] opacity-50 transition-[width] duration-75"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-center tabular-nums opacity-50">{progressPct}%</p>
            <div className="flex justify-center">
              <button
                type="button"
                className={protocolActionBtn}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId)
                  onResonanceHoldStart()
                }}
                onPointerUp={(e) => {
                  if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                    e.currentTarget.releasePointerCapture(e.pointerId)
                  }
                  onResonanceHoldEnd()
                }}
                onPointerLeave={onResonanceHoldEnd}
                onPointerCancel={onResonanceHoldEnd}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault()
                    onResonanceHoldStart()
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault()
                    onResonanceHoldEnd()
                  }
                }}
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Stabilize resonance"
              >
                &gt; STABILIZE_RESONANCE
              </button>
            </div>
          </div>
        )}

        {phase === "decoding" && (
          <div className="space-y-2 font-mono text-[9px] tracking-[0.2em] text-[color:var(--hud-text-dim)] sm:text-[10px]">
            <p className="text-center text-[color:var(--hud-accent)] opacity-80">
              [ PARTIAL DECODE IN PROGRESS ]
            </p>
            <p className="text-center text-[color:var(--hud-accent)] opacity-90">{decodeLine}</p>
            <ul className="space-y-1 opacity-40">
              {DECODE_LINES.map((line, index) => (
                <li
                  key={line}
                  className={
                    index === decodeStep ? "text-[color:var(--hud-accent)] opacity-100" : ""
                  }
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}
      </StripPanel>
    </div>
  )
}
