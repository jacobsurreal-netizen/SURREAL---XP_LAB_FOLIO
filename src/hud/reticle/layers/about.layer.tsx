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
  const opacity = active ? intensity * 0.45 : 0.04

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity }}>
      <div className="relative" style={{ width: 120, height: 120 }}>
        {[
          { top: 0, left: 0, rotate: "0deg" },
          { top: 0, right: 0, rotate: "90deg" },
          { bottom: 0, left: 0, rotate: "-90deg" },
          { bottom: 0, right: 0, rotate: "180deg" },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              ...pos,
              width: 18,
              height: 18,
              borderTop: `1.5px solid ${color}`,
              borderLeft: `1.5px solid ${color}`,
              transform: `rotate(${pos.rotate})`,
            }}
          />
        ))}
      </div>
    </div>
  )
}