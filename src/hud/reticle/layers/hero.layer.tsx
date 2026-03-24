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
  const opacity = active ? intensity * 0.5 : 0.05

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg width="260" height="260" viewBox="0 0 260 260" style={{ opacity }}>
        <path
          d="M 70 80 A 70 70 0 0 1 190 80"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 70 180 A 70 70 0 0 0 190 180"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  )
}