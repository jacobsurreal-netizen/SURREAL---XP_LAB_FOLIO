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
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{
        opacity: active ? intensity : 0.04,
      }}
    >
      <div className="relative" style={{ width: 180, height: 180 }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            width: 1,
            height: 180,
            background: color,
            transform: "translateX(-50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: 180,
            height: 1,
            background: color,
            transform: "translateY(-50%)",
          }}
        />
      </div>
    </div>
  )
}