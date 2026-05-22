"use client"

export interface ReconHudCompositionProps {
  sectorIndex: number
  isMobile?: boolean
  sectorName?: string
  progress?: number
}

const PANEL_TITLES = ["OBSERVATION SCAN", "SUBJECT ANALYSIS", "GATEWAY OPS"] as const

const METER_PLACEHOLDERS = [
  { label: "GRAVIMETRIC", width: "84%", value: "84%" },
  { label: "FIELD RESOLUTION", width: "76%", value: "76%" },
  { label: "SIGNAL LOCK", width: "88%", value: "88%" },
] as const

const RIGHT_PANEL_DATA = [
  { label: "FIELD WAVE", value: "DETECTED" },
  { label: "BIO-SIGNATURE", value: "NEGATIVE" },
  { label: "SPATIAL DIST", value: "0.003%" },
  { label: "UPLINK", value: "STABLE" },
] as const

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

function RightDiagnosticPanel() {
  return (
    <div className="absolute right-3 top-1/2 w-40 -translate-y-1/2 opacity-90 lg:right-6 lg:w-48">
      <div className="relative p-2.5 lg:p-3">
        <CompositionBrackets />
        <div className="mb-2 font-mono text-[7px] tracking-[0.26em] text-[color:var(--hud-text-dim)] lg:mb-2.5">
          FIELD READINGS LOG
        </div>
        <div className="space-y-2 lg:space-y-2.5">
          {RIGHT_PANEL_DATA.map((item) => (
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

function BottomCommandStrip({ compact }: { compact?: boolean }) {
  const textSize = compact ? "text-[6px]" : "text-[7px] md:text-[8px]"
  const spacing = compact ? "gap-4" : "gap-6 md:gap-10"

  return (
    <div
      className={`absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex ${spacing} text-[color:var(--hud-text-dim)] font-mono tracking-[0.2em] opacity-60 ${textSize}`}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="opacity-50">COORDINATES</span>
        <span className="text-[color:var(--hud-accent)]">49.507R / -55.7802</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="opacity-50">RECON VECTOR</span>
        <span className="text-[color:var(--hud-accent)]">NOMINAL</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="opacity-50">PROBE CONTROL</span>
        <span className="text-[color:var(--hud-accent)]">AUTO</span>
      </div>
    </div>
  )
}

function DesktopComposition({
  sectorIndex,
  sectorName,
  progress,
}: {
  sectorIndex: number
  sectorName: string
  progress: number
}) {
  const panelTitle = PANEL_TITLES[Math.min(sectorIndex, 2)]

  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
      <DesktopFrame />

      <div className="absolute top-5 left-1/2 -translate-x-1/2 lg:top-6">
        <TopStatusStrip sectorName={sectorName} progress={progress} />
      </div>

      <div className="absolute left-3 top-1/2 w-36 -translate-y-1/2 opacity-90 lg:left-6 lg:w-40">
        <div className="relative p-2.5 lg:p-3">
          <CompositionBrackets />
          <div className="mb-2 font-mono text-[7px] tracking-[0.26em] text-[color:var(--hud-text-dim)] lg:mb-2.5">
            {panelTitle}
          </div>
          <div className="space-y-2 lg:space-y-2.5">
            {METER_PLACEHOLDERS.map((meter) => (
              <StaticMeterShell key={meter.label} label={meter.label} width={meter.width} value={meter.value} />
            ))}
          </div>
        </div>
      </div>

      <RightDiagnosticPanel />

      <div className="absolute inset-0 flex items-center justify-center">
        <ScanRing />
      </div>

      <BottomCommandStrip />
    </div>
  )
}

function MobileComposition({
  sectorName,
  progress,
}: {
  sectorName: string
  progress: number
}) {
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

        <div className="relative p-2.5 opacity-90">
          <CompositionBrackets compact />
          <div className="grid grid-cols-2 gap-3">
            <StaticMeterShell label="GRAVIMETRIC" width="84%" value="84%" compact />
            <StaticMeterShell label="FIELD RES." width="76%" value="76%" compact />
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <ScanRing small />
      </div>

      <BottomCommandStrip compact />
    </div>
  )
}

export function ReconHudComposition({
  sectorIndex,
  isMobile,
  sectorName = "OBSERVATION",
  progress = 0,
}: ReconHudCompositionProps) {
  const safeIndex = Math.min(Math.max(0, sectorIndex), 2)

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      {!isMobile && (
        <DesktopComposition
          sectorIndex={safeIndex}
          sectorName={sectorName}
          progress={progress}
        />
      )}
      {isMobile && <MobileComposition sectorName={sectorName} progress={progress} />}
    </div>
  )
}
