import Link from "next/link"

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

export function ReconArPlaceholder() {
  return (
    <main
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[color:var(--world-bg,#040b0a)] px-5 py-10"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% 45%, color-mix(in srgb, var(--hud-glow) 12%, transparent), transparent 70%),
          linear-gradient(var(--hud-grid) 1px, transparent 1px),
          linear-gradient(90deg, var(--hud-grid) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 64px 64px, 64px 64px",
      }}
    >
      <div
        className="pointer-events-none absolute inset-6 border border-[color:var(--hud-accent-dim)] opacity-40 md:inset-10"
        aria-hidden="true"
      />

      <div
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-4 px-5 py-8 text-center border border-[color:var(--hud-accent-dim)] bg-black/30 backdrop-blur-[2px]"
        style={{
          boxShadow: "0 0 32px color-mix(in srgb, var(--hud-glow) 22%, transparent)",
        }}
      >
        <HudCornerBrackets />

        <p className="font-mono text-[length:clamp(0.55rem,2.5vw,0.7rem)] tracking-[0.28em] text-[color:var(--hud-text-dim)]">
          [ DIAGNOSTIC PROBE ]
        </p>

        <div
          className="h-px w-14"
          style={{ background: "color-mix(in srgb, var(--hud-accent-dim) 80%, transparent)" }}
          aria-hidden="true"
        />

        <h1
          className="font-mono text-[length:clamp(0.85rem,4vw,1.1rem)] font-semibold tracking-[0.2em] text-[color:var(--hud-accent)]"
          style={{
            textShadow: "0 0 12px color-mix(in srgb, var(--hud-glow) 45%, transparent)",
          }}
        >
          MARKER SCANNER STANDBY
        </h1>

        <p className="font-mono text-[length:clamp(0.6rem,2.8vw,0.75rem)] tracking-[0.18em] text-[color:var(--hud-text)]">
          PHYSICAL ARTIFACT REQUIRED
        </p>

        <div className="relative mt-2 w-full border border-[color:var(--hud-accent-dim)] bg-[color:var(--hud-accent-dim)] px-4 py-6">
          <HudCornerBrackets compact />
          <p className="font-mono text-[10px] leading-relaxed tracking-[0.22em] text-[color:var(--hud-text-dim)]">
            AR TRACKING OFFLINE
            <br />
            MINDAR NOT INITIALIZED
          </p>
        </div>

        <Link
          href="/recon"
          className="pointer-events-auto relative mt-2 border border-[color:var(--hud-accent-dim)] px-5 py-2.5 font-mono text-[length:clamp(0.6rem,2.5vw,0.7rem)] tracking-[0.18em] text-[color:var(--hud-text)] transition hover:bg-[color:var(--hud-accent-dim)] hover:text-[color:var(--hud-accent)]"
        >
          [ RETURN TO OBSERVATION DECK ]
        </Link>
      </div>

      <p className="relative z-10 mt-6 max-w-xs text-center font-mono text-[9px] tracking-[0.2em] text-[color:var(--hud-text-dim)] opacity-70">
        MOBILE PROBE HANDOFF — SESSION STANDBY
      </p>
    </main>
  )
}
