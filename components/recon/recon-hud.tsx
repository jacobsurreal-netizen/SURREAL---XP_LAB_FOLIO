"use client"

import { useEffect, useState } from "react"
import { ReconHudComposition } from "./recon-hud-composition"

interface ReconHUDProps {
  sectorIndex: number
  isMobile?: boolean
  sectorName?: string
  progress?: number
}

const RECON_AR_URL = "/recon/ar"

const SECTOR_DATA = [
  {
    line1: "[ RECON MODE ]",
    line2: "[ OBSERVATION DECK ]",
    line3: "[ ANOMALY CONTAINED ]",
  },
  {
    line1: "[ SUBJECT_ANALYSIS ]",
    line2: "[ ANOMALY DETECTED ]",
    line3: "[ TELEMETRY PARTIAL ]",
  },
  {
    line1: "[ INITIATE PHYSICAL RECON ]",
    line2: "[ TRANSFER SESSION TO MOBILE PROBE ]",
    line3: "[ GATEWAY PENDING ]",
  },
]

function clampSectorIndex(index: number) {
  return Math.min(Math.max(0, index), 2)
}

function HudCornerBrackets({ compact }: { compact?: boolean }) {
  const size = compact ? "w-3 h-3" : "w-4 h-4"
  const colorClass = "text-[color:var(--hud-accent)] opacity-30"

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg className={`absolute top-0 left-0 ${size} ${colorClass}`} viewBox="0 0 16 16">
        <path d="M0 16 V0 H16" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`absolute top-0 right-0 ${size} ${colorClass}`} viewBox="0 0 16 16">
        <path d="M16 16 V0 H0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`absolute bottom-0 left-0 ${size} ${colorClass}`} viewBox="0 0 16 16">
        <path d="M0 0 V16 H16" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`absolute bottom-0 right-0 ${size} ${colorClass}`} viewBox="0 0 16 16">
        <path d="M16 0 V16 H0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  )
}

function HudButtonCorners() {
  const cornerClass = "absolute w-2 h-2 text-[color:var(--hud-accent)] opacity-30"

  return (
    <>
      <svg className={`${cornerClass} top-0 left-0`} viewBox="0 0 8 8" aria-hidden="true">
        <path d="M0 8 V0 H8" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`${cornerClass} top-0 right-0`} viewBox="0 0 8 8" aria-hidden="true">
        <path d="M8 8 V0 H0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`${cornerClass} bottom-0 left-0`} viewBox="0 0 8 8" aria-hidden="true">
        <path d="M0 0 V8 H8" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`${cornerClass} bottom-0 right-0`} viewBox="0 0 8 8" aria-hidden="true">
        <path d="M8 0 V8 H0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </>
  )
}

const hudActionBtn =
  "relative border border-[color:var(--hud-accent-dim)] px-4 py-2 font-mono text-xs tracking-[0.18em] text-[color:var(--hud-text)] transition hover:bg-[color:var(--hud-accent-dim)] hover:text-[color:var(--hud-accent)]"

interface GatewayModalProps {
  open: boolean
  onClose: () => void
}

function GatewayModal({ open, onClose }: GatewayModalProps) {
  if (!open) return null

  const statusRows = [
    { label: "GATEWAY", value: "READY" },
    { label: "PROBE", value: "STANDBY" },
    { label: "TRACKING", value: "OFFLINE" },
  ] as const

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[120] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-label="RECON AR transfer modal"
    >
      <div
        className="relative w-full max-w-md border border-[color:var(--hud-accent-dim)] bg-black/90 p-5 sm:p-6"
        style={{ boxShadow: "0 0 40px color-mix(in srgb, var(--hud-glow) 35%, transparent)" }}
      >
        <HudCornerBrackets />

        <div className="mb-4 font-mono text-[length:clamp(0.6rem,2vw,0.7rem)] tracking-[0.26em] text-[color:var(--hud-text-dim)]">
          [ TRANSFER SESSION TO MOBILE PROBE ]
        </div>

        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--hud-text)] opacity-90">
          Observation Deck → Diagnostic Probe handoff
        </p>

        <div
          className="relative mb-4 border border-[color:var(--hud-accent-dim)] bg-black/40 px-4 py-4"
          style={{
            boxShadow: "inset 0 0 24px color-mix(in srgb, var(--hud-accent-dim) 35%, transparent)",
          }}
        >
          <HudCornerBrackets compact />
          <div className="space-y-3 text-center font-mono">
            <p className="text-[10px] tracking-[0.28em] text-[color:var(--hud-accent)]">
              TRANSFER LINK READY
            </p>
            <p className="text-[9px] tracking-[0.22em] text-[color:var(--hud-text-dim)]">
              MOBILE PROBE ENDPOINT
            </p>
            <p
              className="break-all text-[length:clamp(0.65rem,2.5vw,0.8rem)] tracking-[0.14em] text-[color:var(--hud-text)] tabular-nums"
              style={{
                textShadow: "0 0 10px color-mix(in srgb, var(--hud-glow) 35%, transparent)",
              }}
            >
              {RECON_AR_URL}
            </p>
            <p className="text-[9px] tracking-[0.2em] text-[color:var(--hud-text-dim)]">
              SCAN ROUTE: {RECON_AR_URL}
            </p>
          </div>
        </div>

        <div className="mb-5 space-y-1.5 border border-[color:var(--hud-accent-dim)] bg-[color:var(--hud-accent-dim)] px-3 py-2.5">
          {statusRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between font-mono text-[9px] tracking-[0.18em]"
            >
              <span className="text-[color:var(--hud-text-dim)]">{row.label}</span>
              <span className="text-[color:var(--hud-accent)] tabular-nums">{row.value}</span>
            </div>
          ))}
        </div>

        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--hud-text-dim)]">
          Open mobile scanner to continue recon on probe route
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a href={RECON_AR_URL} className={`${hudActionBtn} text-center sm:flex-1`}>
            <HudButtonCorners />
            OPEN MOBILE SCANNER
          </a>

          <button
            type="button"
            onClick={onClose}
            className={`${hudActionBtn} text-center text-[color:var(--hud-text-dim)] sm:flex-1`}
          >
            <HudButtonCorners />
            [ CLOSE ]
          </button>
        </div>
      </div>
    </div>
  )
}

export function ReconHUD({ sectorIndex, isMobile, sectorName, progress = 0 }: ReconHUDProps) {
  const safeSectorIndex = clampSectorIndex(sectorIndex)
  const data = SECTOR_DATA[safeSectorIndex]
  const [isGatewayOpen, setIsGatewayOpen] = useState(false)

  useEffect(() => {
    if (safeSectorIndex !== 2) {
      setIsGatewayOpen(false)
    }
  }, [safeSectorIndex])

  const line1Class =
    "font-mono font-medium leading-tight tracking-[0.22em] select-none text-center uppercase text-[length:clamp(0.5rem,1.1vw,0.68rem)]"
  const line2Class =
    "recon-hud-primary-line font-mono font-semibold leading-snug tracking-[0.16em] select-none text-center uppercase text-[length:clamp(0.72rem,2vw,1.05rem)] max-w-[min(100%,20rem)]"
  const line3Class =
    "font-mono font-normal leading-tight tracking-[0.18em] select-none text-center uppercase text-[length:clamp(0.5rem,1.2vw,0.72rem)] opacity-90"
  const ctaBtn = isMobile
    ? `pointer-events-auto relative ${hudActionBtn} mt-1`
    : `pointer-events-auto relative ${hudActionBtn} mt-1.5 px-4 py-2 tracking-[0.2em]`

  const panelPadding = isMobile ? "px-3.5 py-3" : "px-5 py-4"
  const panelGap = isMobile ? "gap-1.5" : "gap-2"

  return (
    <>
      <style>{`
        @keyframes recon-hud-primary-bloom {
          0%,
          100% {
            text-shadow:
              0 0 6px color-mix(in srgb, var(--hud-glow) 45%, transparent),
              0 0 1px color-mix(in srgb, var(--hud-accent) 30%, transparent);
          }
          50% {
            text-shadow:
              0 0 12px color-mix(in srgb, var(--hud-glow) 65%, transparent),
              0 0 3px color-mix(in srgb, var(--hud-accent) 40%, transparent);
          }
        }

        @keyframes recon-hud-primary-glitch {
          0%,
          96%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          97% {
            transform: translate3d(0.6px, 0, 0);
          }
          98% {
            transform: translate3d(-0.6px, 0, 0);
          }
        }

        .recon-hud-primary-line {
          animation:
            recon-hud-primary-bloom 5s ease-in-out infinite,
            recon-hud-primary-glitch 9s steps(1, end) infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .recon-hud-primary-line {
            animation: none;
            text-shadow: 0 0 8px color-mix(in srgb, var(--hud-glow) 50%, transparent);
          }
        }
      `}</style>

    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center px-4">
      <ReconHudComposition
        sectorIndex={safeSectorIndex}
        isMobile={isMobile}
        sectorName={sectorName}
        progress={progress}
      />
      <div
        className={`relative z-10 flex max-w-[min(88vw,22rem)] flex-col items-center ${panelGap} ${panelPadding} border border-[color:var(--hud-accent-dim)] bg-black/25 backdrop-blur-[2px] transition-opacity duration-300`}
        style={{
          boxShadow:
            "0 0 24px color-mix(in srgb, var(--hud-glow) 18%, transparent), inset 0 0 20px color-mix(in srgb, var(--hud-accent-dim) 25%, transparent)",
        }}
      >
        <HudCornerBrackets compact={isMobile} />

        <span className={line1Class} style={{ color: "var(--hud-text-dim)" }}>
          {data.line1}
        </span>

        <div
          className="h-px w-12 shrink-0"
          style={{ background: "color-mix(in srgb, var(--hud-accent-dim) 70%, transparent)" }}
          aria-hidden="true"
        />

        <span className={line2Class} style={{ color: "var(--hud-accent)" }}>
          {data.line2}
        </span>

        <div
          className="h-px w-12 shrink-0"
          style={{ background: "color-mix(in srgb, var(--hud-accent-dim) 70%, transparent)" }}
          aria-hidden="true"
        />

        <span className={line3Class} style={{ color: "var(--hud-text)" }}>
          {data.line3}
        </span>

        {safeSectorIndex === 2 &&
          (isMobile ? (
            <a href={RECON_AR_URL} className={ctaBtn}>
              <HudButtonCorners />
              [ ACTIVATE SCANNER ]
            </a>
          ) : (
            <button type="button" onClick={() => setIsGatewayOpen(true)} className={ctaBtn}>
              <HudButtonCorners />
              [ REQUEST_AR_LINK ]
            </button>
          ))}
      </div>

      {!isMobile && <GatewayModal open={isGatewayOpen} onClose={() => setIsGatewayOpen(false)} />}
    </div>
    </>
  )
}
