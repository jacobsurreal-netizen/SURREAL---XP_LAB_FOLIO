"use client"

interface GhostLayerProps {
  active: boolean
  intensity: number
  color: string
}

export function HeroLayer({
  active,
  intensity,
  color,
}: GhostLayerProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{
        opacity: active ? intensity : 0.06,
      }}
    >
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: "9999px",
          border: `1px dashed ${color}`,
        }}
      />
    </div>
  )
}