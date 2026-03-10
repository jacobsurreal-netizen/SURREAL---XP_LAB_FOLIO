/**
 * Phase 1 HUD tokens.
 *
 * Source-of-truth ownership intentionally stays OUTSIDE this module.
 * The HUD only receives the current mode from props.
 */
export const HUD_MODES = {
  NORMAL: "NORMAL",
  IR: "IR",
} as const

export type HudMode = (typeof HUD_MODES)[keyof typeof HUD_MODES]

export const HUD_TOKENS = {
  NORMAL: {
    accent: "#00f0d4",
    accentDim: "#00f0d466",
    accentGlow: "#00f0d422",
    accentMicro: "#00f0d418",
  },
  IR: {
    accent: "#ff2244",
    accentDim: "#ff224466",
    accentGlow: "#ff224422",
    accentMicro: "#ff224418",
  },
  shared: {
    parallax: { grid: 2, frameA: 6, frameB: 10, reticle: 16 },
    opacity: {
      line: 0.6,
      glow: 0.35,
      dim: 0.25,
      icon: 0.8,
      micro: 0.15,
    },
  },
} as const

export type HudOpacity = typeof HUD_TOKENS.shared.opacity

export function hudGlow(color: string, px: number): string {
  return `drop-shadow(0 0 ${px}px ${color})`
}
