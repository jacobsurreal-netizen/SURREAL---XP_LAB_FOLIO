"use client"

interface ReconHUDProps {
  sectorIndex: number
}

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

export function ReconHUD({ sectorIndex }: ReconHUDProps) {
  const data = SECTOR_DATA[Math.min(Math.max(0, sectorIndex), 2)]

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 transition-opacity duration-300">
        <span
          className="font-heading text-[clamp(1.5rem,5vw,4rem)] font-bold leading-none tracking-[0.2em] select-none opacity-40 text-center"
          style={{ color: "var(--hud-accent-dim, rgba(160, 130, 210, 0.55))" }}
        >
          {data.line1}
        </span>
        <span
          className="font-heading text-[clamp(2rem,8vw,6rem)] font-bold leading-none tracking-[0.2em] select-none opacity-60 text-center"
          style={{ color: "var(--hud-accent, rgba(180, 120, 255, 0.95))" }}
        >
          {data.line2}
        </span>
        <span
          className="font-mono text-[clamp(0.8rem,2vw,1.5rem)] tracking-[0.2em] select-none opacity-50 mt-8 text-center"
          style={{ color: "var(--hud-text, rgba(205, 170, 255, 0.82))" }}
        >
          {data.line3}
        </span>
      </div>
    </div>
  )
}
