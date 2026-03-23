"use client"

interface GhostLayerProps {
  active: boolean
  intensity: number
  color: string
}

export function AboutLayer({
  active,
  intensity,
  color,
}: GhostLayerProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{
        opacity: active ? intensity : 0.04,
      }}
    >
      <div
        style={{
          width: 140,
          height: 140,
          border: `1px solid ${color}`,
        }}
      />
    </div>
  )
}