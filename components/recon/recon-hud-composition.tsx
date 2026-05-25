"use client"

import { useEffect, useState } from "react"

import type { ReconTelemetry } from "./use-recon-telemetry"

export interface ReconHudCompositionProps {
  sectorIndex: number
  isMobile?: boolean
  sectorName?: string
  progress?: number
  onRequestArLink?: () => void
  suppressGatewayCommand?: boolean
  telemetry?: ReconTelemetry
}

// ─── Sector-specific HUD data ───────────────────────────────────────────────

const PANEL_TITLES = ["OBSERVATION SCAN", "SUBJECT ANALYSIS", "GATEWAY OPS"] as const

const RETICLE_LABELS = [
  "LOG_000 // DORMANT",
  "NODE_ALPHA // PARTIAL LOCK",
  "CONTACT WINDOW // READY",
] as const

const RIGHT_PANEL_DATA = [
  // Sector 0 — Observation
  [
    { label: "FIELD WAVE", value: "DETECTED" },
    { label: "BIO-SIGNATURE", value: "NULL" },
    { label: "SPATIAL DIST", value: "0.003% RISING" },
    { label: "MATERIAL", value: "UNKNOWN" },
    { label: "CONTAINMENT", value: "NOMINAL" },
  ],
  // Sector 1 — Analysis
  [
    { label: "GRAVIMETRIC WAVE", value: "FLUCTUATING" },
    { label: "OPTICAL MODEL", value: "DEGRADED" },
    { label: "VIEWPOINT COUNT", value: "INSUFFICIENT" },
    { label: "MATERIAL COMP", value: "UNKNOWN" },
    { label: "MEMBRANE", value: "UNSTABLE" },
  ],
  // Sector 2 — Gateway
  [
    { label: "TOKEN CHANNEL", value: "REQUIRED" },
    { label: "PROBE ENDPOINT", value: "STANDBY" },
    { label: "AR LINK", value: "READY" },
    { label: "TRANSFER", value: "AVAILABLE" },
    { label: "ORIGIN ACCESS", value: "LOCKED" },
  ],
] as const

const BOTTOM_STATUS = [
  "CONTAINMENT FIELD: STABLE",
  "SINGLE VIEWPOINT INSUFFICIENT",
  "PHYSICAL TOKEN REQUIRED",
] as const

function formatSessionTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function hasValidViewport(telemetry: ReconTelemetry | undefined): boolean {
  return (
    !!telemetry &&
    telemetry.viewportWidth > 0 &&
    telemetry.viewportHeight > 0
  )
}

function formatViewportValue(
  telemetry: ReconTelemetry | undefined,
  displayReady: boolean,
): string {
  if (!displayReady || !hasValidViewport(telemetry)) return "--×--"
  return `${telemetry!.viewportWidth}×${telemetry!.viewportHeight}`
}

function formatPointerTrace(
  telemetry: ReconTelemetry | undefined,
  displayReady: boolean,
): string {
  if (
    !displayReady ||
    !telemetry?.pointerActive ||
    telemetry.pointerNormalizedX == null ||
    telemetry.pointerNormalizedY == null
  ) {
    return "IDLE"
  }
  const pad = (n: number) => String(n).padStart(3, "0")
  const x = pad(Math.round(telemetry.pointerNormalizedX * 100))
  const y = pad(Math.round(telemetry.pointerNormalizedY * 100))
  return `X ${x} / Y ${y}`
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getMobileMeterValues(
  telemetry: ReconTelemetry | undefined,
  sectorIndex: number,
  progress: number,
) {
  if (!telemetry) {
    return {
      gravimetric: undefined,
      fieldRes: undefined,
    }
  }

  const timePhase = ((telemetry.sessionTimeSeconds % 90) / 90)
  const progressFactor = Math.max(0, Math.min(1, progress))
  const pixelFactor = Math.min(Math.max(telemetry.devicePixelRatio ?? 1, 1), 3)

  const gravBase = 80 + sectorIndex * 4
  const gravValue = Math.round(gravBase + timePhase * 4 + progressFactor * 2 + (pixelFactor - 1) * 1)
  const gravimetric = `${clampNumber(gravValue, 80, 94)}%`

  const fieldBase = 70 + sectorIndex * 2
  const fieldValue = Math.round(fieldBase + progressFactor * 10 + timePhase * 4)
  const fieldRes = `${clampNumber(fieldValue, 70, 88)}%`

  return { gravimetric, fieldRes }
}

function formatSessionDisplay(
  telemetry: ReconTelemetry | undefined,
  displayReady: boolean,
): string {
  if (!displayReady || !telemetry) return "00:00"
  return formatSessionTime(telemetry.sessionTimeSeconds)
}

function formatDeviceClock(deviceClock: string | undefined, displayReady: boolean) {
  if (!displayReady || !deviceClock) return "--:--:--"
  return deviceClock
}

function formatClockDate(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  const ss = String(d.getSeconds()).padStart(2, "0")
  return `${hh}:${mm}:${ss}`
}

function getDesktopTelemetryRows(
  telemetry: ReconTelemetry | undefined,
  displayReady: boolean,
) {
  return [
    { label: "VIEWPORT", value: formatViewportValue(telemetry, displayReady) },
    { label: "POINTER TRACE", value: formatPointerTrace(telemetry, displayReady) },
    { label: "SESSION", value: formatSessionDisplay(telemetry, displayReady) },
  ] as const
}

function getMobileTelemetryRows(
  telemetry: ReconTelemetry | undefined,
  displayReady: boolean,
  deviceClock?: string,
) {
  return [
    { label: "VIEWPORT", value: formatViewportValue(telemetry, displayReady) },
    { label: "DEVICE CLOCK", value: formatDeviceClock(deviceClock, displayReady) },
    { label: "PROBE UPTIME", value: formatSessionDisplay(telemetry, displayReady) },
  ] as const
}

// ─── Primitives ──────────────────────────────────────────────────────────────

function CompositionBrackets({ compact }: { compact?: boolean }) {
  const size = compact ? "w-3 h-3" : "w-4 h-4"
  const colorClass = "text-[color:var(--hud-accent)] opacity-25"

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

function TCenterMarker({ small }: { small?: boolean }) {
  const size = small ? "w-[clamp(24px,6vmin,32px)]" : "w-[clamp(36px,7vmin,52px)]"
  return (
    <svg
      viewBox="0 0 40 40"
      className={`${size} text-[color:var(--hud-accent)] opacity-[0.38] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
      aria-hidden="true"
    >
      <line x1="20" y1="0" x2="20" y2="15" stroke="currentColor" strokeWidth="1" />
      <line x1="20" y1="25" x2="20" y2="40" stroke="currentColor" strokeWidth="1" />
      <line x1="0" y1="20" x2="15" y2="20" stroke="currentColor" strokeWidth="1" />
      <line x1="25" y1="20" x2="40" y2="20" stroke="currentColor" strokeWidth="1" />
      <circle cx="20" cy="20" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function ScanRing({ small }: { small?: boolean }) {
  const size = small ? "w-[clamp(200px,65vmin,320px)]" : "w-[clamp(300px,45vmin,500px)]"
  return (
    <div className={`relative ${size} aspect-square flex items-center justify-center opacity-30 text-[color:var(--hud-accent)]`}>
      <svg className="absolute inset-0 w-full h-full animate-[spin_60s_linear_infinite]" viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="98" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" />
        <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 4" />
        <path d="M 100 2 L 100 8 M 100 192 L 100 198 M 2 100 L 8 100 M 192 100 L 198 100" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className="absolute inset-0 w-full h-full animate-[spin_40s_linear_infinite_reverse]" viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="20 10 5 10" />
      </svg>
      <TCenterMarker small={small} />
    </div>
  )
}

function DesktopFrame() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 hidden h-full w-full text-[color:var(--hud-accent)] opacity-[0.17] md:block"
      preserveAspectRatio="none"
      viewBox="0 0 1000 1000"
      aria-hidden="true"
    >
      <line x1="0" y1="50" x2="300" y2="50" stroke="currentColor" strokeWidth="0.5" />
      <line x1="700" y1="50" x2="1000" y2="50" stroke="currentColor" strokeWidth="0.5" />
      <line x1="0" y1="950" x2="300" y2="950" stroke="currentColor" strokeWidth="0.5" />
      <line x1="700" y1="950" x2="1000" y2="950" stroke="currentColor" strokeWidth="0.5" />
      <line x1="50" y1="0" x2="50" y2="300" stroke="currentColor" strokeWidth="0.5" />
      <line x1="50" y1="700" x2="50" y2="1000" stroke="currentColor" strokeWidth="0.5" />
      <line x1="950" y1="0" x2="950" y2="300" stroke="currentColor" strokeWidth="0.5" />
      <line x1="950" y1="700" x2="950" y2="1000" stroke="currentColor" strokeWidth="0.5" />
      <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.3" opacity="0.6" />
      <line x1="1000" y1="0" x2="900" y2="100" stroke="currentColor" strokeWidth="0.3" opacity="0.6" />
      <line x1="0" y1="1000" x2="100" y2="900" stroke="currentColor" strokeWidth="0.3" opacity="0.6" />
      <line x1="1000" y1="1000" x2="900" y2="900" stroke="currentColor" strokeWidth="0.3" opacity="0.6" />
    </svg>
  )
}

function MobileFrame() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-[color:var(--hud-accent)] opacity-[0.15] md:hidden"
      preserveAspectRatio="none"
      viewBox="0 0 400 800"
      aria-hidden="true"
    >
      <line x1="0" y1="30" x2="120" y2="30" stroke="currentColor" strokeWidth="0.5" />
      <line x1="280" y1="30" x2="400" y2="30" stroke="currentColor" strokeWidth="0.5" />
      <line x1="0" y1="770" x2="120" y2="770" stroke="currentColor" strokeWidth="0.5" />
      <line x1="280" y1="770" x2="400" y2="770" stroke="currentColor" strokeWidth="0.5" />
      <line x1="20" y1="0" x2="20" y2="150" stroke="currentColor" strokeWidth="0.5" />
      <line x1="20" y1="650" x2="20" y2="800" stroke="currentColor" strokeWidth="0.5" />
      <line x1="380" y1="0" x2="380" y2="150" stroke="currentColor" strokeWidth="0.5" />
      <line x1="380" y1="650" x2="380" y2="800" stroke="currentColor" strokeWidth="0.5" />
    </svg>
  )
}

function StaticMeterShell({
  label,
  width,
  value,
  compact,
}: {
  label: string
  width: string
  value?: string
  compact?: boolean
}) {
  return (
    <div className={compact ? "space-y-0.5" : "space-y-1"}>
      <div
        className={`flex justify-between tracking-[0.18em] text-[color:var(--hud-text-dim)] ${
          compact ? "text-[7px]" : "text-[8px] md:text-[9px]"
        }`}
      >
        <span className="max-w-[9rem] truncate">{label}</span>
        <span className="tabular-nums opacity-80 text-[color:var(--hud-accent)]">{value || "—"}</span>
      </div>
      <div
        className={`relative w-full overflow-hidden bg-[color:var(--hud-accent-dim)] ${
          compact ? "h-px" : "h-[2px]"
        }`}
      >
        <div
          className="absolute inset-y-0 left-0 bg-[color:var(--hud-accent)] opacity-40"
          style={{ width }}
        />
      </div>
    </div>
  )
}

// ─── Top status strip ────────────────────────────────────────────────────────

function TopStatusStrip({
  sectorName,
  progress,
  compact,
}: {
  sectorName: string
  progress: number
  compact?: boolean
}) {
  const progressPct = Math.round(Math.max(0, Math.min(1, progress)) * 100)
  const textSize = compact ? "text-[7px]" : "text-[7px] md:text-[8px]"

  return (
    <div
      className={`flex items-center justify-center gap-3 tracking-[0.2em] text-[color:var(--hud-text-dim)] ${textSize}`}
    >
      <span>SECTOR: {sectorName}</span>
      <span className="h-3 w-px bg-[color:var(--hud-accent-dim)]" aria-hidden="true" />
      <span>MODE: RECON</span>
      <span className="h-3 w-px bg-[color:var(--hud-accent-dim)]" aria-hidden="true" />
      <span className="tabular-nums">PROGRESS: {progressPct}%</span>
    </div>
  )
}

// ─── Reticle label — near-artifact microcopy ─────────────────────────────────

/**
 * Small instrument label that floats just below the scan-ring center.
 * Carries sector-specific artifact ID / status. NOT a card — no background.
 */
function ReticleLabel({ sectorIndex }: { sectorIndex: number }) {
  const label = RETICLE_LABELS[Math.min(sectorIndex, 2)]
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2"
      style={{ bottom: "calc(50% - clamp(160px, 25vmin, 270px))" }}
      aria-hidden="true"
    >
      <div className="flex items-center gap-1.5">
        {/* tick mark left */}
        <div className="h-px w-3 bg-[color:var(--hud-accent)] opacity-30" />
        <span
          className="font-mono text-[7px] tracking-[0.22em] text-[color:var(--hud-accent)] opacity-50 whitespace-nowrap"
        >
          {label}
        </span>
        {/* tick mark right */}
        <div className="h-px w-3 bg-[color:var(--hud-accent)] opacity-30" />
      </div>
    </div>
  )
}

// ─── Left scanner panel ───────────────────────────────────────────────────────

function LeftScannerPanel({
  sectorIndex,
  telemetry,
}: {
  sectorIndex: number
  telemetry?: ReconTelemetry
}) {
  const [displayReady, setDisplayReady] = useState(false)
  useEffect(() => {
    setDisplayReady(true)
  }, [])

  const panelTitle = PANEL_TITLES[Math.min(sectorIndex, 2)]
  const rows = getDesktopTelemetryRows(telemetry, displayReady)
  return (
    <div className="absolute left-3 top-1/2 w-48 -translate-y-1/2 opacity-90 lg:left-6 lg:w-56">
      <div className="relative p-2.5 lg:p-3">
        <CompositionBrackets />
        <div className="mb-2 font-mono text-[7px] tracking-[0.26em] text-[color:var(--hud-text-dim)] lg:mb-2.5">
          {panelTitle}
        </div>
        <div className="space-y-2 lg:space-y-2.5">
          {rows.map((item) => (
            <div
              key={item.label}
              className="flex items-baseline justify-between gap-2 font-mono text-[7px] tracking-[0.15em] text-[color:var(--hud-text-dim)] md:text-[8px]"
            >
              <span className="shrink-0">{item.label}</span>
              <span className="shrink-0 whitespace-nowrap tabular-nums text-[color:var(--hud-accent)] opacity-80">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Right diagnostic panel ───────────────────────────────────────────────────

function RightDiagnosticPanel({ sectorIndex }: { sectorIndex: number }) {
  const rows = RIGHT_PANEL_DATA[Math.min(sectorIndex, 2)]
  return (
    <div className="absolute right-3 top-1/2 w-40 -translate-y-1/2 opacity-90 lg:right-6 lg:w-48">
      <div className="relative p-2.5 lg:p-3">
        <CompositionBrackets />
        <div className="mb-2 font-mono text-[7px] tracking-[0.26em] text-[color:var(--hud-text-dim)] lg:mb-2.5">
          FIELD READINGS LOG
        </div>
        <div className="space-y-2 lg:space-y-2.5">
          {rows.map((item) => (
            <div
              key={item.label}
              className="flex justify-between font-mono text-[7px] tracking-[0.15em] text-[color:var(--hud-text-dim)] md:text-[8px]"
            >
              <span>{item.label}</span>
              <span className="text-[color:var(--hud-accent)] opacity-80">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Gateway terminal command (sector 2, desktop) ───────────────────────────

function GatewayCommandTrigger({ onRequestArLink }: { onRequestArLink: () => void }) {
  return (
    <div
      className="pointer-events-auto absolute bottom-[16vh] left-1/2 z-10 flex -translate-x-1/2 translate-y-5 flex-col items-center gap-2 md:bottom-[20vh]"
      role="group"
      aria-label="Gateway transfer command"
    >
      <button
        type="button"
        onClick={onRequestArLink}
        className="group relative min-w-[min(88vw,16rem)] border border-[color:var(--hud-accent)] bg-transparent px-6 py-3 font-mono transition duration-200 hover:border-[color:var(--hud-accent)] hover:bg-[color:var(--hud-accent-dim)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--hud-accent)]"
        style={{
          boxShadow:
            "0 0 0 1px color-mix(in srgb, var(--hud-accent-dim) 50%, transparent), 0 0 20px color-mix(in srgb, var(--hud-glow) 18%, transparent)",
        }}
      >
        <CompositionBrackets compact />
        <span
          className="relative block text-[length:clamp(0.72rem,1.5vw,0.9rem)] font-medium tracking-[0.2em] text-[color:var(--hud-accent)] transition group-hover:text-[color:var(--hud-text)]"
          style={{
            textShadow: "0 0 14px color-mix(in srgb, var(--hud-glow) 40%, transparent)",
          }}
        >
          &gt; REQUEST_AR_LINK
        </span>
      </button>
      <span className="font-mono text-[7px] tracking-[0.24em] text-[color:var(--hud-text-dim)] opacity-70 md:text-[8px]">
        PHYSICAL TOKEN REQUIRED
      </span>
    </div>
  )
}

// ─── Bottom command strip ─────────────────────────────────────────────────────

interface BottomCommandStripProps {
  compact?: boolean
  sectorIndex?: number
}

function BottomCommandStrip({ compact, sectorIndex = 0 }: BottomCommandStripProps) {
  const textSize = compact ? "text-[6px]" : "text-[7px] md:text-[8px]"
  const spacing = compact ? "gap-4" : "gap-6 md:gap-10"
  const statusLine = BOTTOM_STATUS[Math.min(sectorIndex, 2)]
  const isGateway = sectorIndex === 2

  return (
    <div
      className={`absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 md:bottom-8 ${textSize}`}
    >
      <div
        className={`flex ${spacing} font-mono tracking-[0.2em] text-[color:var(--hud-text-dim)] opacity-60`}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="opacity-50">ORIGIN VECTOR</span>
          <span className="text-[color:var(--hud-accent)]">TOKEN-LOCKED</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="opacity-50">RESONANCE</span>
          <span className="text-[color:var(--hud-accent)]">F#4 // 370Hz</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="opacity-50">OPERATOR</span>
          <span className="text-[color:var(--hud-accent)]">OBSERVER_CLASS</span>
        </div>
      </div>

      <div
        className="hidden h-px w-48 opacity-20 md:block"
        style={{ background: "var(--hud-accent)" }}
        aria-hidden="true"
      />

      {!isGateway && (
        <div
          className={`font-mono tracking-[0.22em] text-[color:var(--hud-accent)] opacity-40 ${compact ? "text-[6px]" : "text-[7px]"}`}
        >
          {statusLine}
        </div>
      )}
    </div>
  )
}

// ─── Desktop composition ──────────────────────────────────────────────────────

function DesktopComposition({
  sectorIndex,
  sectorName,
  progress,
  onRequestArLink,
  suppressGatewayCommand,
  telemetry,
}: {
  sectorIndex: number
  sectorName: string
  progress: number
  onRequestArLink?: () => void
  suppressGatewayCommand?: boolean
  telemetry?: ReconTelemetry
}) {
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
      <DesktopFrame />

      <div className="absolute top-5 left-1/2 -translate-x-1/2 lg:top-6">
        <TopStatusStrip sectorName={sectorName} progress={progress} />
      </div>

      <LeftScannerPanel sectorIndex={sectorIndex} telemetry={telemetry} />

      <RightDiagnosticPanel sectorIndex={sectorIndex} />

      <div className="absolute inset-0 flex items-center justify-center">
        <ScanRing />
      </div>

      {/* Reticle label — floats just below scan ring center */}
      <ReticleLabel sectorIndex={sectorIndex} />

      {sectorIndex === 2 && onRequestArLink && !suppressGatewayCommand && (
        <GatewayCommandTrigger onRequestArLink={onRequestArLink} />
      )}

      <div className="pointer-events-auto">
        <BottomCommandStrip sectorIndex={sectorIndex} />
      </div>
    </div>
  )
}

// ─── Mobile composition ───────────────────────────────────────────────────────

function MobileComposition({
  sectorName,
  progress,
  sectorIndex,
  telemetry,
}: {
  sectorName: string
  progress: number
  sectorIndex: number
  telemetry?: ReconTelemetry
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [displayReady, setDisplayReady] = useState(false)
  const [deviceClock, setDeviceClock] = useState<string>("--:--:--")

  useEffect(() => {
    setDisplayReady(true)
  }, [])

  useEffect(() => {
    if (!displayReady) return
    let mounted = true
    const updateClock = () => {
      if (!mounted) return
      setDeviceClock(formatClockDate(new Date()))
    }
    updateClock()
    const id = setInterval(updateClock, 1000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [displayReady])

  const statusLine = BOTTOM_STATUS[Math.min(sectorIndex, 2)]
  const { gravimetric, fieldRes } = getMobileMeterValues(telemetry, sectorIndex, progress)
  const telemetryRows = getMobileTelemetryRows(telemetry, displayReady, deviceClock)

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col md:hidden" aria-hidden="true">
      <MobileFrame />

      <div className="flex-shrink-0 px-3 pb-1.5 pt-4">
        <div className="mb-1.5 text-center">
          <div className="font-mono text-[6px] tracking-[0.26em] text-[color:var(--hud-text-dim)] opacity-80">
            DEEP-SPACE RECON
          </div>
          <TopStatusStrip sectorName={sectorName} progress={progress} compact />
        </div>

        <div className="relative p-2.5 opacity-90 pointer-events-auto z-20">
          <CompositionBrackets compact />
          <div className="grid grid-cols-2 gap-3">
            <StaticMeterShell
              label="GRAVIMETRIC"
              width={gravimetric || "0%"}
              value={displayReady && gravimetric ? gravimetric : "--%"}
              compact
            />
            <StaticMeterShell
              label="FIELD RES."
              width={fieldRes || "0%"}
              value={displayReady && fieldRes ? fieldRes : "--%"}
              compact
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[6px] tracking-[0.22em] text-[color:var(--hud-text-dim)] uppercase opacity-80">
                TELEMETRY
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen((open) => !open)}
              className="pointer-events-auto relative z-20 select-none touch-manipulation [-webkit-user-select:none] [-webkit-touch-callout:none] font-mono text-[6px] tracking-[0.22em] text-[color:var(--hud-accent)] uppercase"
            >
              {drawerOpen ? "COLLAPSE" : "EXPAND"}
            </button>
          </div>

          {drawerOpen && (
            <div className="mt-3 rounded border border-[color:var(--hud-accent-dim)] bg-[#040b0a]/80 p-3 text-[7px] tracking-[0.18em] text-[color:var(--hud-text-dim)] opacity-90">
              <div className="space-y-2">
                {telemetryRows.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between font-mono text-[7px] tracking-[0.18em]"
                  >
                    <span>{item.label}</span>
                    <span className="tabular-nums text-[color:var(--hud-accent)] opacity-80">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <ScanRing small />
      </div>

      {/* Mobile bottom strip — telemetry only in gateway (status lives near command CTA) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        {sectorIndex !== 2 && (
          <div className="font-mono text-[6px] tracking-[0.22em] text-[color:var(--hud-accent)] opacity-40 whitespace-nowrap">
            {statusLine}
          </div>
        )}
        <div className="flex gap-4 font-mono text-[6px] tracking-[0.18em] text-[color:var(--hud-text-dim)] opacity-50">
          <span>ORIGIN VECTOR</span>
          <span className="text-[color:var(--hud-accent)]">TOKEN-LOCKED</span>
        </div>
      </div>
    </div>
  )
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function ReconHudComposition({
  sectorIndex,
  isMobile,
  sectorName = "OBSERVATION",
  progress = 0,
  onRequestArLink,
  suppressGatewayCommand,
  telemetry,
}: ReconHudCompositionProps) {
  // Prefer telemetry values if provided
  const safeIndex = typeof telemetry?.sectorIndex === "number" ? telemetry.sectorIndex : Math.min(Math.max(0, sectorIndex), 2)
  const displaySectorName = telemetry?.sectorName ?? sectorName
  const displayProgress = typeof telemetry?.progressPercent === "number" ? telemetry.progressPercent : Math.round(progress * 100)

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      {!isMobile && (
        <DesktopComposition
          sectorIndex={safeIndex}
          sectorName={displaySectorName}
          progress={displayProgress / 100}
          onRequestArLink={onRequestArLink}
          suppressGatewayCommand={suppressGatewayCommand}
          telemetry={telemetry}
        />
      )}
      {isMobile && (
        <MobileComposition
          sectorName={displaySectorName}
          progress={displayProgress / 100}
          sectorIndex={safeIndex}
          telemetry={telemetry}
        />
      )}
    </div>
  )
}
