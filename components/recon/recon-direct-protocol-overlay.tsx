"use client"

import type { DirectProtocolPhase } from "./use-recon-direct-protocol"

const protocolActionBtn =
  "relative border border-[color:var(--hud-accent-dim)] px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-[color:var(--hud-text)] transition hover:bg-[color:var(--hud-accent-dim)] hover:text-[color:var(--hud-accent)]"

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

export interface ReconDirectProtocolOverlayProps {
  phase: DirectProtocolPhase
  onAcknowledge: () => void
}

export function ReconDirectProtocolOverlay({ phase, onAcknowledge }: ReconDirectProtocolOverlayProps) {
  if (phase === "idle") return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[14vh] z-[125] flex justify-center px-4 md:bottom-[18vh]"
      role="region"
      aria-label="Direct Observation Protocol"
    >
      <div
        className="pointer-events-auto relative max-w-md border border-[color:var(--hud-accent-dim)] bg-[#040b0a]/75 px-4 py-3 opacity-90 backdrop-blur-sm"
        style={{ boxShadow: "0 0 24px color-mix(in srgb, var(--hud-glow) 20%, transparent)" }}
      >
        <ProtocolCornerBrackets />

        <div className="space-y-2 font-mono text-[9px] tracking-[0.2em] text-[color:var(--hud-text-dim)] sm:text-[10px]">
          <p className="text-center text-[color:var(--hud-accent)] opacity-80">
            [ DIRECT OBSERVATION PROTOCOL ]
          </p>
          <p className="text-center opacity-70">VIEWPOINT SET: PENDING</p>
          <p className="text-center opacity-50">PARTIAL DATA ONLY</p>
          <p className="text-center text-[8px] tracking-[0.16em] opacity-40">
            ORIGIN VECTOR — TOKEN-LOCKED
          </p>
        </div>

        <div className="mt-3 flex justify-center">
          <button type="button" onClick={onAcknowledge} className={protocolActionBtn}>
            &gt; ACKNOWLEDGE_PROTOCOL
          </button>
        </div>
      </div>
    </div>
  )
}
