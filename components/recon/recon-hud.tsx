"use client"

import { useEffect, useState } from "react"

interface ReconHUDProps {
  sectorIndex: number
  isMobile?: boolean
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

interface GatewayModalProps {
  open: boolean
  onClose: () => void
}

function GatewayModal({ open, onClose }: GatewayModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="RECON AR transfer modal"
    >
      <div className="w-full max-w-md border border-cyan-300/30 bg-black/90 p-6 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
        <div className="mb-6 font-mono text-xs tracking-[0.25em] text-cyan-200/80">
          [ TRANSFER SESSION TO MOBILE PROBE ]
        </div>

        <div className="mb-6 flex aspect-square w-full items-center justify-center border border-cyan-300/25 bg-cyan-300/5">
          <div className="text-center font-mono text-xs tracking-[0.3em] text-cyan-100/60">
            QR LINK PENDING
          </div>
        </div>

        <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-cyan-100/70">
          SCAN TO CONTINUE RECON PROCEDURE
        </p>

        <div className="flex items-center justify-between gap-4">
          <a
            href={RECON_AR_URL}
            className="border border-cyan-300/40 px-4 py-2 font-mono text-xs tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-300/10"
          >
            OPEN MOBILE SCANNER
          </a>

          <button
            type="button"
            onClick={onClose}
            className="border border-cyan-300/20 px-4 py-2 font-mono text-xs tracking-[0.18em] text-cyan-100/70 transition hover:bg-cyan-300/10 hover:text-cyan-100"
          >
            [ CLOSE ]
          </button>
        </div>
      </div>
    </div>
  )
}

export function ReconHUD({ sectorIndex, isMobile }: ReconHUDProps) {
  const safeSectorIndex = clampSectorIndex(sectorIndex)
  const data = SECTOR_DATA[safeSectorIndex]
  const [isGatewayOpen, setIsGatewayOpen] = useState(false)

  useEffect(() => {
    if (safeSectorIndex !== 2) {
      setIsGatewayOpen(false)
    }
  }, [safeSectorIndex])

  // Responsive text classes
  const heading1 = isMobile
    ? "font-heading text-lg font-bold leading-none tracking-[0.15em] select-none opacity-40 text-center"
    : "font-heading text-[clamp(1.5rem,5vw,4rem)] font-bold leading-none tracking-[0.2em] select-none opacity-40 text-center"
  const heading2 = isMobile
    ? "font-heading text-2xl font-bold leading-none tracking-[0.15em] select-none opacity-60 text-center"
    : "font-heading text-[clamp(2rem,8vw,6rem)] font-bold leading-none tracking-[0.2em] select-none opacity-60 text-center"
  const subtext = isMobile
    ? "font-mono text-xs tracking-[0.15em] select-none opacity-50 mt-4 text-center"
    : "font-mono text-[clamp(0.8rem,2vw,1.5rem)] tracking-[0.2em] select-none opacity-50 mt-8 text-center"
  const ctaBtn = isMobile
    ? "pointer-events-auto mt-6 border border-cyan-300/40 px-4 py-2 font-mono text-xs tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-300/10"
    : "pointer-events-auto mt-8 border border-cyan-300/40 px-5 py-3 font-mono text-xs tracking-[0.22em] text-cyan-100 transition hover:bg-cyan-300/10"

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 transition-opacity duration-300">
        <span className={heading1} style={{ color: "var(--hud-accent-dim, rgba(160, 130, 210, 0.55))" }}>{data.line1}</span>
        <span className={heading2} style={{ color: "var(--hud-accent, rgba(180, 120, 255, 0.95))" }}>{data.line2}</span>
        <span className={subtext} style={{ color: "var(--hud-text, rgba(205, 170, 255, 0.82))" }}>{data.line3}</span>
        {safeSectorIndex === 2 && (
          isMobile ? (
            <a
              href="/recon/ar"
              className={ctaBtn}
            >
              [ ACTIVATE SCANNER ]
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setIsGatewayOpen(true)}
              className={ctaBtn}
            >
              [ REQUEST_AR_LINK ]
            </button>
          )
        )}
      </div>
      {!isMobile && (
        <GatewayModal open={isGatewayOpen} onClose={() => setIsGatewayOpen(false)} />
      )}
    </div>
  )
}
