"use client"

import { useMemo, useRef } from "react"
import {
  HUD_MODES,
  HUD_TOKENS,
  hudGlow,
  type HudMode,
  type HudOpacity,
} from "./hud-tokens"
import { useMouseParallax } from "./hooks/use-mouse-parallax"

interface LayerProps {
  accent: string
  dim: string
  glow: string
  micro: string
  o: HudOpacity
}

export interface HudParallaxProps {
  /** Visual mode only. Runtime ownership stays outside the component. */
  mode?: HudMode
  /** Mount inside an existing HUD layer; defaults to absolute fill. */
  className?: string
  /** Optional integration hooks for Phase 1 bottom controls. */
  onPrev?: () => void
  onNext?: () => void
  onToggleMode?: () => void
  /** Cosmetic labels only for Phase 1. */
  leftHint?: string
  centerHint?: string
  rightHint?: string
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ")
}

export function HudFrameCorners({ accent, dim, o }: LayerProps) {
  const s = { stroke: accent, strokeWidth: 0.8, fill: "none" as const }
  const d = { stroke: dim, strokeWidth: 0.4, fill: "none" as const }

  return (
    <>
      <div className="absolute top-0 left-0 right-0 flex items-start justify-center h-16 md:h-20">
        <svg
          viewBox="0 0 1400 70"
          className="w-full max-w-[96vw] h-full"
          preserveAspectRatio="xMidYMin meet"
          style={{ filter: hudGlow(accent, 4) }}
        >
          <line x1="0" y1="12" x2="480" y2="12" {...s} opacity={o.line} />
          <polyline points="480,12 510,28 540,28" {...s} opacity={o.line} />
          <line x1="540" y1="28" x2="640" y2="28" {...d} opacity={o.dim} strokeDasharray="2 5" />
          <polyline points="640,28 675,8 700,8" {...s} opacity={o.line} />
          <polyline points="700,8 725,8 760,28" {...s} opacity={o.line} />
          <circle cx="700" cy="8" r="2" fill={accent} opacity={o.glow} />
          <circle cx="700" cy="8" r="0.8" fill={accent} opacity={0.9} />
          <line x1="680" y1="5" x2="680" y2="11" {...d} opacity={o.micro} />
          <line x1="720" y1="5" x2="720" y2="11" {...d} opacity={o.micro} />
          <text x="700" y="20" fill={dim} fontSize="3.5" fontFamily="monospace" opacity={o.micro} textAnchor="middle">
            SYS.CORE
          </text>
          <line x1="760" y1="28" x2="860" y2="28" {...d} opacity={o.dim} strokeDasharray="2 5" />
          <polyline points="860,28 890,28 920,12" {...s} opacity={o.line} />
          <line x1="920" y1="12" x2="1400" y2="12" {...s} opacity={o.line} />
          {[120, 240, 360, 1040, 1160, 1280].map((x) => (
            <g key={x}>
              <line x1={x} y1="7" x2={x} y2="17" {...d} opacity={0.25} />
              <line x1={x - 15} y1="10" x2={x - 15} y2="14" {...d} opacity={o.micro} />
              <line x1={x + 15} y1="10" x2={x + 15} y2="14" {...d} opacity={o.micro} />
            </g>
          ))}
          {Array.from({ length: 28 }, (_, i) => 30 + i * 48).map((x) => (
            <line key={`ft-${x}`} x1={x} y1="10" x2={x} y2="14" {...d} opacity={0.07} />
          ))}
          {[560, 580, 600, 620, 780, 800, 820, 840].map((x, i) => (
            <circle key={`sd-${x}`} cx={x} cy="28" r="0.6" fill={accent} opacity={o.micro}>
              <animate attributeName="opacity" values={`${0.05};${0.35};${0.05}`} dur={`${2.5 + i * 0.4}s`} repeatCount="indefinite" />
            </circle>
          ))}
          <text x="40" y="24" fill={dim} fontSize="3.5" fontFamily="monospace" opacity={o.micro}>RAIL.L // 01</text>
          <text x="1360" y="24" fill={dim} fontSize="3.5" fontFamily="monospace" opacity={o.micro} textAnchor="end">RAIL.R // 02</text>
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={`ld-${i}`} cx={8 + i * 6} cy="26" r="0.5" fill={accent} opacity={0.08} />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={`rd-${i}`} cx={1370 + i * 6} cy="26" r="0.5" fill={accent} opacity={0.08} />
          ))}
          <line x1="0" y1="36" x2="200" y2="36" {...d} opacity={0.06} />
          <line x1="1200" y1="36" x2="1400" y2="36" {...d} opacity={0.06} />
        </svg>
      </div>

      <svg className="absolute top-3 left-3 w-16 h-16 md:w-24 md:h-24" viewBox="0 0 100 100" style={{ filter: hudGlow(accent, 3) }}>
        <polyline points="0,40 0,0 40,0" {...s} opacity={o.dim} />
        <line x1="0" y1="55" x2="0" y2="62" {...d} opacity={0.1} />
        <line x1="55" y1="0" x2="62" y2="0" {...d} opacity={0.1} />
        <circle cx="0" cy="0" r="1.5" fill={accent} opacity={0.12} />
      </svg>
      <svg className="absolute top-3 right-3 w-16 h-16 md:w-24 md:h-24" viewBox="0 0 100 100" style={{ filter: hudGlow(accent, 3) }}>
        <polyline points="100,40 100,0 60,0" {...s} opacity={o.dim} />
        <line x1="100" y1="55" x2="100" y2="62" {...d} opacity={0.1} />
        <line x1="38" y1="0" x2="45" y2="0" {...d} opacity={0.1} />
        <circle cx="100" cy="0" r="1.5" fill={accent} opacity={0.12} />
      </svg>
      <svg className="absolute bottom-3 left-3 w-16 h-16 md:w-24 md:h-24" viewBox="0 0 100 100" style={{ filter: hudGlow(accent, 3) }}>
        <polyline points="0,60 0,100 40,100" {...s} opacity={o.dim} />
        <line x1="55" y1="100" x2="62" y2="100" {...d} opacity={0.1} />
      </svg>
      <svg className="absolute bottom-3 right-3 w-16 h-16 md:w-24 md:h-24" viewBox="0 0 100 100" style={{ filter: hudGlow(accent, 3) }}>
        <polyline points="100,60 100,100 60,100" {...s} opacity={o.dim} />
        <line x1="38" y1="100" x2="45" y2="100" {...d} opacity={0.1} />
      </svg>
    </>
  )
}

export function HudSidePanel({ side, accent, dim, o }: LayerProps & { side: "left" | "right" }) {
  const isLeft = side === "left"
  const s = { stroke: accent, strokeWidth: 0.8, fill: "none" as const }
  const d = { stroke: dim, strokeWidth: 0.4, fill: "none" as const }

  const title = isLeft ? "NODE-A7" : "NODE-B3"
  const rows = isLeft
    ? [
        { label: "FREQ", value: "440 Hz" },
        { label: "AMP", value: "0.72" },
        { label: "PHASE", value: "+12.4" },
        { label: "PWR", value: "98.1%" },
      ]
    : [
        { label: "LATT", value: "47.38N" },
        { label: "LONG", value: "122.3W" },
        { label: "ALT", value: "4.2 AU" },
        { label: "VELO", value: "0.003c" },
      ]

  return (
    <div className={`absolute ${isLeft ? "left-2 md:left-4" : "right-2 md:right-4"} top-1/2 -translate-y-1/2`}>
      <svg
        width="70"
        height="340"
        viewBox="0 0 70 340"
        className="md:w-[90px] md:h-[430px]"
        style={{ filter: hudGlow(accent, 4), transform: isLeft ? "none" : "scaleX(-1)" }}
      >
        <polyline points="60,18 18,18 8,36 8,304 18,322 60,322" {...s} opacity={o.line} />
        <polyline points="52,32 24,32 18,44 18,296 24,308 52,308" {...d} opacity={0.15} />
        <polygon points="36,52 18,84 54,84" {...s} opacity={o.icon} />
        <polygon points="36,62 24,80 48,80" fill={accent} stroke={accent} strokeWidth={0.3} opacity={o.glow} />
        <circle cx="36" cy="74" r="1.2" fill={accent} opacity={0.45} />
        <circle cx="36" cy="74" r="0.5" fill={accent} opacity={0.8} />
        <polygon points="48,96 56,102 48,108" fill={accent} opacity={o.dim} />
        <line x1="18" y1="114" x2="52" y2="114" {...d} opacity={0.12} />
        <text x="20" y="128" fill={dim} fontSize="4.5" fontFamily="monospace" opacity={0.35} style={{ transform: isLeft ? "none" : "scaleX(-1)", transformOrigin: "35px 128px" }}>{title}</text>
        <text x="20" y="136" fill={dim} fontSize="3" fontFamily="monospace" opacity={0.15} style={{ transform: isLeft ? "none" : "scaleX(-1)", transformOrigin: "35px 136px" }}>SECTOR 04 // ONLINE</text>
        <line x1="20" y1="140" x2="50" y2="140" {...d} opacity={0.1} />
        {rows.map((row, i) => (
          <g key={row.label}>
            <text x="20" y={155 + i * 14} fill={dim} fontSize="3" fontFamily="monospace" opacity={o.micro} style={{ transform: isLeft ? "none" : "scaleX(-1)", transformOrigin: `35px ${155 + i * 14}px` }}>{row.label}</text>
            <text x="20" y={161 + i * 14} fill={accent} fontSize="3.5" fontFamily="monospace" opacity={o.dim} style={{ transform: isLeft ? "none" : "scaleX(-1)", transformOrigin: `35px ${161 + i * 14}px` }}>{row.value}</text>
          </g>
        ))}
        <line x1="12" y1="215" x2="12" y2="290" {...d} opacity={0.18} />
        {Array.from({ length: 16 }, (_, i) => 215 + i * 5).map((y) => (
          <line key={`vr-${y}`} x1={y % 15 === 0 ? 7 : 9} y1={y} x2="12" y2={y} {...d} opacity={y % 15 === 0 ? 0.2 : 0.08} />
        ))}
        <circle cx="36" cy="240" r="5" {...d} opacity={0.15} />
        <line x1="36" y1="233" x2="36" y2="235" {...d} opacity={0.12} />
        <line x1="36" y1="245" x2="36" y2="247" {...d} opacity={0.12} />
        <line x1="29" y1="240" x2="31" y2="240" {...d} opacity={0.12} />
        <line x1="41" y1="240" x2="43" y2="240" {...d} opacity={0.12} />
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2, 3, 4].map((c) => (
            <circle key={`dg-${r}-${c}`} cx={20 + c * 6} cy={258 + r * 6} r="0.5" fill={accent} opacity={0.1} />
          ))
        )}
        {[6, 12, 9, 16, 5, 11, 7].map((h, i) => (
          <rect key={`bc-${i}`} x={18 + i * 5} y={298 - h} width="2.5" height={h} fill={accent} opacity={0.1} rx="0.3" />
        ))}
      </svg>
    </div>
  )
}

export function HudReticle({ accent, dim, glow, o }: LayerProps) {
  const s = { stroke: accent, strokeWidth: 0.8, fill: "none" as const }
  const d = { stroke: dim, strokeWidth: 0.4, fill: "none" as const }
  const c = 130

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <svg width="260" height="260" viewBox="0 0 260 260" className="md:w-[360px] md:h-[360px]" style={{ filter: hudGlow(accent, 8) }}>
        <polyline points="15,60 15,15 60,15" {...s} opacity={o.line} />
        <polyline points="200,15 245,15 245,60" {...s} opacity={o.line} />
        <polyline points="15,200 15,245 60,245" {...s} opacity={o.line} />
        <polyline points="200,245 245,245 245,200" {...s} opacity={o.line} />
        <polyline points="50,90 50,50 90,50" {...d} opacity={0.2} />
        <polyline points="170,50 210,50 210,90" {...d} opacity={0.2} />
        <polyline points="50,170 50,210 90,210" {...d} opacity={0.2} />
        <polyline points="170,210 210,210 210,170" {...d} opacity={0.2} />
        <line x1="105" y1={c} x2="122" y2={c} {...d} opacity={o.dim} />
        <line x1="138" y1={c} x2="155" y2={c} {...d} opacity={o.dim} />
        <line x1={c} y1="105" x2={c} y2="122" {...d} opacity={o.dim} />
        <line x1={c} y1="138" x2={c} y2="155" {...d} opacity={o.dim} />
        <polygon points={`${c},${c - 8} ${c + 8},${c} ${c},${c + 8} ${c - 8},${c}`} {...d} opacity={o.dim} />
        <circle cx={c} cy={c} r="1.5" fill={accent} opacity={0.5} />
        <circle cx={c} cy={c} r="0.5" fill={accent} opacity={0.9} />
        <path d={`M ${c} ${c} L ${c} ${c - 55} A 55 55 0 0 1 ${c + 40} ${c - 38} Z`} fill={glow} opacity={0.03}>
          <animateTransform attributeName="transform" type="rotate" from={`0 ${c} ${c}`} to={`360 ${c} ${c}`} dur="14s" repeatCount="indefinite" />
        </path>
        <circle cx={c} cy={c} r="55" {...d} opacity={0.06} strokeDasharray="3 8" />
        <circle cx={c} cy={c} r="75" {...d} opacity={0.04} strokeDasharray="1 10" />
        <circle cx={c} cy={c} r="95" {...d} opacity={0.025} strokeDasharray="2 14" />
      </svg>
    </div>
  )
}

interface HudBottomNavProps extends LayerProps {
  mode: HudMode
  onPrev?: () => void
  onNext?: () => void
  onToggleMode?: () => void
  leftHint: string
  centerHint: string
  rightHint: string
}

export function HudBottomNav({ accent, dim, o, mode, onPrev, onNext, onToggleMode, leftHint, centerHint, rightHint }: HudBottomNavProps) {
  const s = { stroke: accent, strokeWidth: 0.8, fill: "none" as const }
  const d = { stroke: dim, strokeWidth: 0.4, fill: "none" as const }

  return (
    <div className="absolute top-8 md:bottom-5 left-0 right-0 flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-8 md:gap-12">
        <span className="font-mono text-[6px] md:text-[7px] tracking-[0.2em] uppercase" style={{ color: dim, opacity: o.micro }}>{leftHint}</span>
        <span className="font-mono text-[6px] md:text-[7px] tracking-[0.2em] uppercase" style={{ color: dim, opacity: o.micro }}>{centerHint}</span>
        <span className="font-mono text-[6px] md:text-[7px] tracking-[0.2em] uppercase" style={{ color: dim, opacity: o.micro }}>{rightHint}</span>
      </div>

      <div className="flex items-center gap-6 md:gap-12 pointer-events-auto">
        <button
          type="button"
          onClick={onPrev}
          className="group cursor-pointer bg-transparent border-none p-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-offset-1"
          style={{ ["--tw-ring-color" as string]: accent }}
          aria-label="HUD previous"
        >
          <svg width="38" height="38" viewBox="0 0 44 44" style={{ filter: hudGlow(accent, 4) }}>
            <polygon points="22,2 40,14 34,38 10,38 4,14" {...s} opacity={o.line} className="transition-opacity group-hover:opacity-90" />
            <polygon points="22,14 14,28 30,28" {...s} opacity={o.icon} />
            <path d="M 15,32 L 11,28" {...d} opacity={o.dim} />
          </svg>
        </button>

        <button
          type="button"
          onClick={onToggleMode}
          className="group relative cursor-pointer bg-transparent border-none p-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-offset-1"
          style={{ ["--tw-ring-color" as string]: accent }}
          aria-label={`Toggle HUD mode. Current mode: ${mode}`}
        >
          <svg width="46" height="46" viewBox="0 0 52 52" style={{ filter: hudGlow(accent, 8) }}>
            <polygon points="26,48 6,36 10,10 42,10 46,36" stroke={accent} strokeWidth={1.2} fill="none" opacity={o.line} className="transition-opacity group-hover:opacity-90" />
            <polygon points="26,40 16,20 36,20" fill={mode === HUD_MODES.IR ? accent : "none"} stroke={accent} strokeWidth={0.6} opacity={o.icon} />
          </svg>
          <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 font-mono text-[7px] md:text-[8px] tracking-[0.15em] uppercase whitespace-nowrap" style={{ color: dim, opacity: 0.4 }}>
            {mode === HUD_MODES.IR ? "IR ON" : "IR OFF"}
          </span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="group cursor-pointer bg-transparent border-none p-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-offset-1"
          style={{ ["--tw-ring-color" as string]: accent }}
          aria-label="HUD next"
        >
          <svg width="38" height="38" viewBox="0 0 44 44" style={{ filter: hudGlow(accent, 4) }}>
            <polygon points="22,2 40,14 34,38 10,38 4,14" {...s} opacity={o.line} className="transition-opacity group-hover:opacity-90" />
            <polygon points="22,14 14,28 30,28" {...s} opacity={o.icon} />
            <path d="M 29,32 L 33,28" {...d} opacity={o.dim} />
          </svg>
        </button>
      </div>

      <svg viewBox="0 0 600 12" className="w-56 md:w-72 h-3 mt-1" preserveAspectRatio="xMidYMid meet" style={{ filter: hudGlow(accent, 3) }}>
        <line x1="0" y1="6" x2="250" y2="6" {...d} opacity={0.15} />
        <circle cx="256" cy="6" r="1.2" fill={accent} opacity={0.2} />
        <line x1="262" y1="6" x2="280" y2="6" {...d} opacity={0.25} />
        <circle cx="300" cy="6" r="0.8" fill={accent} opacity={0.15} />
        <line x1="320" y1="6" x2="338" y2="6" {...d} opacity={0.25} />
        <circle cx="344" cy="6" r="1.2" fill={accent} opacity={0.2} />
        <line x1="350" y1="6" x2="600" y2="6" {...d} opacity={0.15} />
      </svg>
    </div>
  )
}

function HudNoiseLayer({ accent }: { accent: string }) {
  const starsRef = useRef<Array<{ x: string; y: string; size: string; opacity: string; delay: string; dur: string }>>([])

  if (starsRef.current.length === 0) {
    starsRef.current = Array.from({ length: 60 }, () => ({
      x: (Math.random() * 100).toFixed(2),
      y: (Math.random() * 100).toFixed(2),
      size: (0.4 + Math.random() * 1.2).toFixed(1),
      opacity: (0.03 + Math.random() * 0.1).toFixed(3),
      delay: (Math.random() * 10).toFixed(1),
      dur: (4 + Math.random() * 6).toFixed(1),
    }))
  }

  return (
    <>
      <svg width="100%" height="100%" className="absolute inset-0 opacity-[0.02]">
        <defs>
          <pattern id="hud-diag" width="50" height="50" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="50" stroke={accent} strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hud-diag)" />
      </svg>
      {starsRef.current.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.x}%`,
            top: `${star.y}%`,
            backgroundColor: accent,
            opacity: star.opacity,
            animation: `hud-twinkle ${star.dur}s ${star.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </>
  )
}

export default function HudParallax({
  mode = HUD_MODES.NORMAL,
  className,
  onPrev,
  onNext,
  onToggleMode,
  leftHint = "<< ROTATE",
  centerHint = "MODE [I]",
  rightHint = "ROTATE >>",
}: HudParallaxProps) {
  const { translate } = useMouseParallax(0.05)
  const px = HUD_TOKENS.shared.parallax

  const tokens = HUD_TOKENS[mode]
  const o = HUD_TOKENS.shared.opacity

  const layerProps = useMemo<LayerProps>(
    () => ({
      accent: tokens.accent,
      dim: tokens.accentDim,
      glow: tokens.accentGlow,
      micro: tokens.accentMicro,
      o,
    }),
    [tokens, o]
  )

  return (
    <div className={cx("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      <style>{`@keyframes hud-twinkle { 0%, 100% { opacity: 0.03; } 50% { opacity: 0.18; } }`}</style>

      <div className="absolute inset-0" style={{ transform: translate(px.grid) }}>
        {/* <HudNoiseLayer accent={tokens.accent} /> */}
      </div>

      <div className="absolute inset-0" style={{ transform: translate(px.frameA) }}>
        <HudFrameCorners {...layerProps} />
      </div>

      <div className="absolute inset-0 hidden md:block" style={{ transform: translate(px.frameB) }}>
        <HudSidePanel side="left" {...layerProps} />
        <HudSidePanel side="right" {...layerProps} />
      </div>

      <div className="absolute inset-0" style={{ transform: translate(px.reticle) }}>
        <HudReticle {...layerProps} />
      </div>

      <HudBottomNav
        {...layerProps}
        mode={mode}
        onPrev={onPrev}
        onNext={onNext}
        onToggleMode={onToggleMode}
        leftHint={leftHint}
        centerHint={centerHint}
        rightHint={rightHint}
      />

      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${tokens.accent} 0px, transparent 1px, transparent 4px)`,
          backgroundSize: "100% 4px",
        }}
      />
    </div>
  )
}
