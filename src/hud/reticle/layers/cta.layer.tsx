"use client"

interface GhostLayerProps {
  active: boolean
  intensity: number
  color: string
}

export function CtaLayer({
  active,
  intensity,
  color,
}: GhostLayerProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{
        opacity: active ? intensity : 0.05,
      }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "36px solid transparent",
          borderRight: "36px solid transparent",
          borderBottom: `64px solid ${color}`,
        }}
      />
    </div>
  )
}