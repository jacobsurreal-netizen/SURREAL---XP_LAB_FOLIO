"use client"

import type { ReconInitPhase } from "./use-recon-init-sequence"
import { BOOT_LINES } from "./use-recon-init-sequence"

const initActionBtn =
  "relative border border-[color:var(--hud-accent-dim)] px-5 py-2.5 font-mono text-xs tracking-[0.2em] text-[color:var(--hud-text)] transition hover:bg-[color:var(--hud-accent-dim)] hover:text-[color:var(--hud-accent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[color:var(--hud-text)]"

function InitCornerBrackets() {
  const cornerClass = "absolute w-3 h-3 text-[color:var(--hud-accent)] opacity-30"

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg className={`${cornerClass} top-0 left-0`} viewBox="0 0 16 16">
        <path d="M0 16 V0 H16" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`${cornerClass} top-0 right-0`} viewBox="0 0 16 16">
        <path d="M16 16 V0 H0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`${cornerClass} bottom-0 left-0`} viewBox="0 0 16 16">
        <path d="M0 0 V16 H16" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`${cornerClass} bottom-0 right-0`} viewBox="0 0 16 16">
        <path d="M16 0 V16 H0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  )
}

export interface ReconInitOverlayProps {
  phase: ReconInitPhase
  bootStep: number
  onInitialize: () => void
}

export function ReconInitOverlay({ phase, bootStep, onInitialize }: ReconInitOverlayProps) {
  const isBooting = phase === "booting"

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[130] flex items-center justify-center bg-black/90 px-4 py-6 backdrop-blur-sm sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-label="RECON diagnostic probe initialization"
    >
      <div
        className="relative w-full max-w-md border border-[color:var(--hud-accent-dim)] bg-[#040b0a]/90 p-6 sm:p-8"
        style={{ boxShadow: "0 0 40px color-mix(in srgb, var(--hud-glow) 30%, transparent)" }}
      >
        <InitCornerBrackets />

        {phase === "standby" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <p className="font-mono text-[length:clamp(0.65rem,2vw,0.75rem)] tracking-[0.28em] text-[color:var(--hud-text-dim)]">
              [ DIAGNOSTIC PROBE STANDBY ]
            </p>
            <button
              type="button"
              onClick={onInitialize}
              className={initActionBtn}
            >
              [ INITIALIZE SYSTEM ]
            </button>
          </div>
        )}

        {isBooting && (
          <div className="flex flex-col items-center gap-5">
            <p className="font-mono text-[length:clamp(0.65rem,2vw,0.75rem)] tracking-[0.26em] text-[color:var(--hud-text-dim)]">
              [ SYSTEM INITIALIZATION ]
            </p>
            <ul className="w-full space-y-2 font-mono text-[10px] tracking-[0.2em] sm:text-[11px]">
              {BOOT_LINES.map((line, index) => {
                const isActive = index === bootStep
                const isComplete = index < bootStep
                return (
                  <li
                    key={line}
                    className={
                      isActive
                        ? "text-[color:var(--hud-accent)] opacity-100"
                        : isComplete
                          ? "text-[color:var(--hud-text-dim)] opacity-50"
                          : "text-[color:var(--hud-text-dim)] opacity-25"
                    }
                  >
                    {line}
                  </li>
                )
              })}
            </ul>
            <button type="button" disabled className={initActionBtn}>
              [ INITIALIZE SYSTEM ]
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
