"use client"

interface WorldLayerProps {
  progress: number
  sector: string
}

export function WorldLayer({ progress }: WorldLayerProps) {
  // Subtle radial intensity shift per sector
  const getRadialIntensity = () => {
    if (progress < 0.25) return 0.02 + (progress / 0.25) * 0.03
    if (progress < 0.5) return 0.05 + ((progress - 0.25) / 0.25) * 0.02
    if (progress < 0.75) return 0.04 - ((progress - 0.5) / 0.25) * 0.02
    return 0.03 + ((progress - 0.75) / 0.25) * 0.01
  }

  const intensity = getRadialIntensity()

  return (
    <div
      className="absolute inset-0 transition-colors duration-700"
      style={{ background: "var(--world-bg)" }}
    >
      {/* Radial glow center -- driven by tokens */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, var(--world-radial) 0%, transparent 100%)`,
          opacity: intensity * 15,
          transition: "opacity 0.3s ease-out",
        }}
      />

      {/* Grid overlay -- uses --hud-grid token */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(var(--hud-grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--hud-grid) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          transform: `translateY(${progress * -40}px)`,
          transition: "transform 0.15s linear",
        }}
      />

      {/* Triangle motifs -- use --hud-accent for stroke */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          viewBox="0 0 200 200"
          className="w-[min(50vw,400px)] h-[min(50vw,400px)] opacity-[0.03]"
          style={{
            transform: `rotate(${progress * 120}deg) scale(${0.8 + progress * 0.4})`,
            transition: "transform 0.3s ease-out",
          }}
        >
          <polygon
            points="100,20 180,170 20,170"
            fill="none"
            stroke="var(--hud-accent)"
            strokeWidth="0.5"
          />
          <polygon
            points="100,50 160,155 40,155"
            fill="none"
            stroke="var(--hud-accent)"
            strokeWidth="0.3"
            strokeOpacity="0.6"
            style={{
              transform: `rotate(${progress * -60}deg)`,
              transformOrigin: "100px 100px",
              transition: "transform 0.3s ease-out",
            }}
          />
          <polygon
            points="100,75 140,145 60,145"
            fill="none"
            stroke="var(--hud-accent)"
            strokeWidth="0.2"
            strokeOpacity="0.4"
            style={{
              transform: `rotate(${progress * 30}deg)`,
              transformOrigin: "100px 100px",
              transition: "transform 0.3s ease-out",
            }}
          />
        </svg>
      </div>

      {/* Subtle scan line -- uses accent color */}
      <div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          top: `${(progress * 300) % 100}%`,
          transition: "top 0.1s linear",
          background: `linear-gradient(to right, transparent, var(--hud-glow), transparent)`,
        }}
      />

      {/* Corner markers */}
      <div className="absolute top-6 left-6 w-4 h-4" style={{ borderLeft: "1px solid var(--hud-accent-dim)", borderTop: "1px solid var(--hud-accent-dim)" }} />
      <div className="absolute top-6 right-6 w-4 h-4" style={{ borderRight: "1px solid var(--hud-accent-dim)", borderTop: "1px solid var(--hud-accent-dim)" }} />
      <div className="absolute bottom-6 left-6 w-4 h-4" style={{ borderLeft: "1px solid var(--hud-accent-dim)", borderBottom: "1px solid var(--hud-accent-dim)" }} />
      <div className="absolute bottom-6 right-6 w-4 h-4" style={{ borderRight: "1px solid var(--hud-accent-dim)", borderBottom: "1px solid var(--hud-accent-dim)" }} />
    </div>
  )
}
