"use client"

interface GhostLayerProps {
  active: boolean
  intensity: number
  color: string
}

export function ProjectsLayer({
  active,
  intensity,
  color,
}: GhostLayerProps) {
  const opacity = active ? intensity * 0.55 : 0.04

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ opacity }}
    >
      <div className="relative" style={{ width: 140, height: 140 }}>
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            width: 1.5,
            height: 24,
            background: color,
            transform: "translateX(-50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            width: 1.5,
            height: 24,
            background: color,
            transform: "translateX(-50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 12,
            width: 24,
            height: 1.5,
            background: color,
            transform: "translateY(-50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: 12,
            width: 24,
            height: 1.5,
            background: color,
            transform: "translateY(-50%)",
          }}
        />
      </div>
    </div>
  )
}