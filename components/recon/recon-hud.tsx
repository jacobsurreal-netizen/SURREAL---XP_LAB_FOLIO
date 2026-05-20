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

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[120] flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="RECON AR transfer modal"
    >
      <div
        className="relative w-full max-w-md border border-[color:var(--hud-accent-dim)] bg-black/90 p-6"
        style={{ boxShadow: "0 0 40px color-mix(in srgb, var(--hud-glow) 35%, transparent)" }}
      >
        <HudCornerBrackets />

        <div className="mb-6 font-mono text-xs tracking-[0.28em] text-[color:var(--hud-text-dim)]">
          [ TRANSFER SESSION TO MOBILE PROBE ]
        </div>

        <div className="relative mb-6 flex aspect-square w-full items-center justify-center border border-[color:var(--hud-accent-dim)] bg-[color:var(--hud-accent-dim)]">
          <HudCornerBrackets compact />
          <div className="text-center font-mono text-xs tracking-[0.3em] text-[color:var(--hud-text-dim)]">
            QR LINK PENDING
          </div>
        </div>

        <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--hud-text)]">
          SCAN TO CONTINUE RECON PROCEDURE
        </p>

        <div className="flex items-center justify-between gap-4">
          <a href={RECON_AR_URL} className={hudActionBtn}>
            <HudButtonCorners />
            OPEN MOBILE SCANNER
          </a>

          <button type="button" onClick={onClose} className={`${hudActionBtn} text-[color:var(--hud-text-dim)]`}>
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

  const heading1 = isMobile
    ? "font-heading text-lg font-bold leading-none tracking-[0.22em] select-none text-center"
    : "font-heading text-[clamp(1.5rem,5vw,4rem)] font-bold leading-none tracking-[0.28em] select-none text-center"
  const heading2 = isMobile
    ? "font-heading text-2xl font-bold leading-none tracking-[0.2em] select-none text-center"
    : "font-heading text-[clamp(2rem,8vw,6rem)] font-bold leading-none tracking-[0.24em] select-none text-center"
  const subtext = isMobile
    ? "font-mono text-xs tracking-[0.2em] select-none text-center"
    : "font-mono text-[clamp(0.8rem,2vw,1.5rem)] tracking-[0.24em] select-none text-center"
  const ctaBtn = isMobile
    ? `pointer-events-auto relative ${hudActionBtn} mt-2`
    : `pointer-events-auto relative ${hudActionBtn} mt-2 px-5 py-3 tracking-[0.22em]`

  const panelPadding = isMobile ? "px-5 py-6" : "px-8 py-8"
  const panelGap = isMobile ? "gap-3" : "gap-5"

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center px-4">
      <ReconHudComposition
        sectorIndex={safeSectorIndex}
        isMobile={isMobile}
        sectorName={sectorName}
        progress={progress}
      />
      <div
        className={`relative z-10 flex max-w-[min(92vw,42rem)] flex-col items-center ${panelGap} ${panelPadding} border border-[color:var(--hud-accent-dim)] transition-opacity duration-300`}
        style={{
          boxShadow: "0 0 48px color-mix(in srgb, var(--hud-glow) 28%, transparent)",
        }}
      >
        <HudCornerBrackets compact={isMobile} />

        <span
          className={heading1}
          style={{
            color: "var(--hud-text-dim)",
            textShadow: "0 0 24px color-mix(in srgb, var(--hud-glow) 40%, transparent)",
          }}
        >
          {data.line1}
        </span>

        {!isMobile && (
          <div
            className="hidden h-px w-16 md:block"
            style={{ background: "color-mix(in srgb, var(--hud-accent-dim) 80%, transparent)" }}
            aria-hidden="true"
          />
        )}

        <span
          className={heading2}
          style={{
            color: "var(--hud-accent)",
            textShadow: "0 0 32px color-mix(in srgb, var(--hud-glow) 55%, transparent)",
          }}
        >
          {data.line2}
        </span>

        {!isMobile && (
          <div
            className="hidden h-px w-16 md:block"
            style={{ background: "color-mix(in srgb, var(--hud-accent-dim) 80%, transparent)" }}
            aria-hidden="true"
          />
        )}

        <span className={subtext} style={{ color: "var(--hud-text)" }}>
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
  )
}
