"use client"

import type { SpectrumMode } from "@/hooks/use-spectrum-mode"
import type { Language } from "@/hooks/use-language"

interface HUDLayerProps {
  progress: number
  sector: string
  sectorIndex: number
  goToSector: (index: number) => void
  spectrumMode: SpectrumMode
  onToggleSpectrum: () => void
  lang: Language
  onCycleLang: () => void
  t: (key: string) => string
}

const SECTORS = [
  { name: "HERO", icon: "M12 2L22 20H2L12 2Z" },
  { name: "ABOUT", icon: "M12 4a8 8 0 100 16 8 8 0 000-16z" },
  { name: "PROJECTS", icon: "M4 4h16v16H4V4z" },
  { name: "CTA", icon: "M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7l3-7z" },
] as const

function formatTimecode(progress: number): string {
  const total = progress * 3600
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = Math.floor(total % 60)
  const f = Math.floor((total % 1) * 24)
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}:${f.toString().padStart(2, "0")}`
}

export function HUDLayer({
  progress,
  sector,
  sectorIndex,
  goToSector,
  spectrumMode,
  onToggleSpectrum,
  lang,
  onCycleLang,
  t,
}: HUDLayerProps) {
  return (
    <div className="absolute inset-0 z-30" role="region" aria-label="HUD Overlay">
      {/* ---- TOP-LEFT TELEMETRY ---- */}
      <div className="absolute top-5 left-5 md:top-8 md:left-8 pointer-events-none select-none">
        <div className="flex flex-col gap-0.5">
          <span
            className="font-mono text-[10px] tracking-[0.25em] leading-tight"
            style={{ color: "var(--hud-ink)" }}
          >
            {`SYSTEM_LINK: ${t("SYSTEM_LINK")}`}
          </span>
          <span
            className="font-mono text-[10px] tracking-[0.25em] leading-tight"
            style={{ color: "var(--hud-ink)" }}
          >
            {`PROBE_STATE: ${t("PROBE_STATE")}`}
          </span>
          <span
            className="font-mono text-[10px] tracking-[0.25em] leading-tight"
            style={{ color: "var(--hud-text)" }}
          >
            {`${t("SECTOR_LABEL")}: ${sector}`}
          </span>
          <span
            className="font-mono text-[10px] tracking-[0.25em] leading-tight tabular-nums mt-1"
            style={{ color: "var(--hud-text-dim)" }}
          >
            {`TC ${formatTimecode(progress)}`}
          </span>
        </div>
        {/* Corner bracket SVG */}
        <svg
          className="absolute -top-2 -left-2 w-4 h-4"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M0 12V0h12" stroke="var(--hud-accent)" strokeOpacity="0.15" strokeWidth="1" />
        </svg>
      </div>

      {/* ---- BOTTOM-CENTER SECTOR INDICATOR ---- */}
      <nav
        className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto"
        role="navigation"
        aria-label="Sector navigation"
      >
        <div className="flex items-center gap-2">
          {/* Left arrow */}
          <button
            type="button"
            onClick={() => goToSector(sectorIndex - 1)}
            className="group flex items-center justify-center w-8 h-8 cursor-pointer bg-transparent border-none outline-none focus-visible:ring-1 focus-visible:ring-[var(--hud-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#040b0a] rounded"
            aria-label={t("PREV_SECTOR")}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M12 5L7 10L12 15"
                stroke="var(--hud-accent)"
                strokeOpacity="0.3"
                strokeWidth="1"
                className="transition-all duration-300 group-hover:[stroke-opacity:0.8] group-focus-visible:[stroke-opacity:0.8]"
              />
            </svg>
          </button>

          {/* Sector icons */}
          <div className="flex items-center gap-1" role="tablist" aria-label="Sectors">
            {SECTORS.map((s, i) => {
              const isActive = i === sectorIndex
              return (
                <button
                  type="button"
                  key={s.name}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`${t("GO_TO_SECTOR")} ${s.name}`}
                  onClick={() => goToSector(i)}
                  className="group flex flex-col items-center gap-1.5 px-2 py-1.5 cursor-pointer bg-transparent border-none outline-none focus-visible:ring-1 focus-visible:ring-[var(--hud-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#040b0a] rounded"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="transition-all duration-500 motion-reduce:transition-none"
                    aria-hidden="true"
                  >
                    <path
                      d={s.icon}
                      stroke={isActive ? "var(--hud-accent)" : "var(--hud-text)"}
                      strokeOpacity={isActive ? 0.9 : 0.15}
                      strokeWidth="1"
                      fill={isActive ? "var(--hud-accent-dim)" : "none"}
                      className="transition-all duration-500 motion-reduce:transition-none"
                    />
                    {isActive && (
                      <circle
                        cx="12"
                        cy="12"
                        r="11"
                        stroke="var(--hud-accent)"
                        strokeOpacity="0.12"
                        strokeWidth="0.5"
                        strokeDasharray="2 3"
                        className="motion-reduce:hidden"
                      />
                    )}
                  </svg>
                  <span
                    className="font-mono text-[8px] tracking-[0.2em] transition-all duration-500 motion-reduce:transition-none"
                    style={{
                      color: isActive ? "var(--hud-accent)" : "var(--hud-text-dim)",
                      opacity: isActive ? 0.8 : 0.4,
                    }}
                  >
                    {s.name}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Right arrow */}
          <button
            type="button"
            onClick={() => goToSector(sectorIndex + 1)}
            className="group flex items-center justify-center w-8 h-8 cursor-pointer bg-transparent border-none outline-none focus-visible:ring-1 focus-visible:ring-[var(--hud-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#040b0a] rounded"
            aria-label={t("NEXT_SECTOR")}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M8 5L13 10L8 15"
                stroke="var(--hud-accent)"
                strokeOpacity="0.3"
                strokeWidth="1"
                className="transition-all duration-300 group-hover:[stroke-opacity:0.8] group-focus-visible:[stroke-opacity:0.8]"
              />
            </svg>
          </button>
        </div>

        {/* Thin connecting line under icons */}
        <svg
          className="w-full h-1 mt-1"
          viewBox="0 0 200 4"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <line x1="20" y1="2" x2="180" y2="2" stroke="var(--hud-accent)" strokeOpacity="0.08" strokeWidth="0.5" />
          <circle
            cx={20 + (sectorIndex / 3) * 160}
            cy="2"
            r="1.5"
            fill="var(--hud-accent)"
            fillOpacity="0.5"
            className="transition-all duration-500 motion-reduce:transition-none"
          />
        </svg>
      </nav>

      {/* ---- BOTTOM-RIGHT CONTROLS (SPECTRUM + LANG) ---- */}
      <div className="absolute bottom-6 right-5 md:bottom-10 md:right-8 pointer-events-auto select-none">
        <div className="flex flex-col items-end gap-3">
          {/* Spectrum toggle */}
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[9px] tracking-[0.2em] leading-none"
              style={{ color: "var(--hud-text-dim)" }}
            >
              {`${t("SPECTRUM")}:`}
            </span>
            <button
              type="button"
              onClick={onToggleSpectrum}
              className="group flex items-center gap-0 cursor-pointer bg-transparent border-none outline-none focus-visible:ring-1 focus-visible:ring-[var(--hud-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#040b0a] rounded"
              aria-label={t("SWITCH_SPECTRUM")}
            >
              <span
                className="font-mono text-[9px] tracking-[0.15em] leading-none px-1.5 py-1 transition-all duration-300"
                style={{
                  color: spectrumMode === "COLOR" ? "var(--hud-accent)" : "var(--hud-text-dim)",
                  borderBottom: spectrumMode === "COLOR" ? "1px solid var(--hud-accent)" : "1px solid transparent",
                }}
              >
                COLOR
              </span>
              <span
                className="font-mono text-[9px] leading-none mx-0.5"
                style={{ color: "var(--hud-text-dim)" }}
                aria-hidden="true"
              >
                |
              </span>
              <span
                className="font-mono text-[9px] tracking-[0.15em] leading-none px-1.5 py-1 transition-all duration-300"
                style={{
                  color: spectrumMode === "IR" ? "var(--hud-accent)" : "var(--hud-text-dim)",
                  borderBottom: spectrumMode === "IR" ? "1px solid var(--hud-accent)" : "1px solid transparent",
                }}
              >
                IR
              </span>
            </button>
          </div>

          {/* Language toggle */}
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[9px] tracking-[0.2em] leading-none"
              style={{ color: "var(--hud-text-dim)" }}
            >
              {`${t("LANG")}:`}
            </span>
            <button
              type="button"
              onClick={onCycleLang}
              className="font-mono text-[9px] tracking-[0.15em] leading-none px-1.5 py-1 cursor-pointer bg-transparent border-none outline-none transition-all duration-300 focus-visible:ring-1 focus-visible:ring-[var(--hud-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#040b0a] rounded"
              style={{
                color: "var(--hud-accent)",
                borderBottom: "1px solid var(--hud-accent)",
              }}
              aria-label={t("CYCLE_LANG")}
            >
              {lang}
            </button>
          </div>
        </div>

        {/* Corner bracket bottom-right */}
        <svg
          className="absolute -bottom-2 -right-2 w-4 h-4"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="M16 4V16H4" stroke="var(--hud-accent)" strokeOpacity="0.15" strokeWidth="1" />
        </svg>
      </div>

      {/* ---- EDGE WHISKER LINES ---- */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        <line x1="0" y1="0" x2="100%" y2="0" stroke="var(--hud-accent)" strokeOpacity="0.04" strokeWidth="0.5" />
        <line x1="0" y1="100%" x2="100%" y2="100%" stroke="var(--hud-accent)" strokeOpacity="0.04" strokeWidth="0.5" />
        <line x1="0" y1="0" x2="0" y2="100%" stroke="var(--hud-accent)" strokeOpacity="0.03" strokeWidth="0.5" />
        <line x1="100%" y1="0" x2="100%" y2="100%" stroke="var(--hud-accent)" strokeOpacity="0.03" strokeWidth="0.5" />
      </svg>

      {/* Screen reader status */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {`Current sector: ${sector}. Spectrum: ${spectrumMode}. Language: ${lang}.`}
      </div>
    </div>
  )
}
