"use client"

import { useEffect, useState } from "react"
import {
  getCameraDebugState,
  subscribeCameraDebug,
  toggleCameraDebug,
  type CameraDebugState,
} from "./scroll-camera-bridge"

function formatNumber(value: number, digits = 3): string {
  return Number.isFinite(value) ? value.toFixed(digits) : "—"
}

export function CameraDebugHUD() {
  const [state, setState] = useState<CameraDebugState>(getCameraDebugState())

  useEffect(() => {
    return subscribeCameraDebug(setState)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.key.toLowerCase() !== "d") return

      const target = event.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()

      if (
        tag === "input" ||
        tag === "textarea" ||
        target?.isContentEditable
      ) {
        return
      }

      toggleCameraDebug()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  if (!state.visible) return null

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 40,
        minWidth: 260,
        padding: "12px 14px",
        background: "rgba(0, 0, 0, 0.72)",
        border: "1px solid rgba(120, 255, 220, 0.28)",
        color: "#8fffe1",
        fontFamily: "monospace",
        fontSize: 12,
        lineHeight: 1.5,
        letterSpacing: "0.04em",
        pointerEvents: "none",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ marginBottom: 8, color: "#b7fff0" }}>
        CAMERA DEBUG HUD
      </div>

      <div>sector: {state.sectorName ?? "—"}</div>
      <div>sectorIndex: {state.sectorIndex ?? "—"}</div>
      <div>snapped: {String(state.isSnapped ?? false)}</div>
      <div>progress: {formatNumber(state.progress)}</div>
      <div>azimuthDeg: {formatNumber(state.azimuthDeg, 1)}</div>
      <div>height: {formatNumber(state.height)}</div>
      <div>elevationDeg: {formatNumber(state.elevationDeg, 1)}</div>
      <div>radiusBias: {formatNumber(state.radiusBias)}</div>
      <div>lookBiasX: {formatNumber(state.lookBiasX)}</div>
      <div>lookBiasY: {formatNumber(state.lookBiasY)}</div>

      <div style={{ marginTop: 8, opacity: 0.7 }}>
        toggle: key "D"
      </div>
    </div>
  )
}