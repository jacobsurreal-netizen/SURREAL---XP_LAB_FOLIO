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
  const opacity = active ? intensity * 0.7 : 0.05

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ opacity }}
    >
      <svg width="90" height="90" viewBox="0 0 90 90">
        <polygon
          points="45,20 63,56 27,56"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="45" cy="60" r="2" fill={color} />
      </svg>
    </div>
  )
}