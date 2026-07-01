"use client"

import { useEffect, useState } from "react"
import { useSpectrumMode } from "@/hooks/use-spectrum-mode"
import { audioRuntime } from "./audio-runtime"
import { collapseActiveProfile } from "./behavior-mapper"
import {
  getSoundDebugState,
  initSoundDebugFromStorage,
  subscribeSoundDebug,
  toggleSoundDebug,
  type SoundDebugState,
} from "./sound-debug-store"
import type { SoundBehaviorState } from "./types"

function formatTriggerList(triggers: string[]): string {
  return triggers.length > 0 ? triggers.join(", ") : "NONE"
}

function formatFlagList(flags: string[]): string {
  return flags.length > 0 ? flags.join(" · ") : "—"
}

function formatLayer(value: string): string {
  return value === "NONE" ? "NONE" : value
}

function formatGain(value: number): string {
  return value.toFixed(2)
}

interface SoundDebugHUDProps {
  behavior: SoundBehaviorState
}

export function SoundDebugHUD({ behavior }: SoundDebugHUDProps) {
  const [debugState, setDebugState] = useState<SoundDebugState>(getSoundDebugState())
  const [gainState, setGainState] = useState(audioRuntime.getGainState())
  const { mode: spectrumMode } = useSpectrumMode()
  const collapsedProfile = collapseActiveProfile(behavior)

  useEffect(() => {
    initSoundDebugFromStorage()
    return subscribeSoundDebug(setDebugState)
  }, [])

  useEffect(() => {
    setGainState(audioRuntime.getGainState())
    return audioRuntime.subscribeGainState(() => {
      setGainState(audioRuntime.getGainState())
    })
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.key.toLowerCase() !== "b") return

      const target = event.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()

      if (
        tag === "input" ||
        tag === "textarea" ||
        target?.isContentEditable
      ) {
        return
      }

      toggleSoundDebug()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  if (!debugState.visible) return null

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 45,
        minWidth: 300,
        padding: "12px 14px",
        background: "rgba(0, 0, 0, 0.72)",
        border: "1px solid rgba(180, 120, 255, 0.32)",
        color: "#d8b8ff",
        fontFamily: "monospace",
        fontSize: 12,
        lineHeight: 1.55,
        letterSpacing: "0.04em",
        pointerEvents: "none",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ marginBottom: 8, color: "#e8d0ff" }}>
        SOUND BEHAVIOR DEBUG
      </div>

      <div>
        AMBIENT_LAYER:{" "}
        <span style={{ color: "#f0e0ff" }}>{behavior.ambientLayer}</span>
      </div>
      <div>
        SECTION_LAYER:{" "}
        <span style={{ color: "#f0e0ff" }}>
          {formatLayer(behavior.sectionLayer)}
        </span>
      </div>
      <div>
        FOCUS_LAYER:{" "}
        <span style={{ color: "#f0e0ff" }}>
          {formatLayer(behavior.focusLayer)}
        </span>
      </div>
      <div>
        EVENT_LAYER:{" "}
        <span style={{ color: "#f0e0ff" }}>
          {formatLayer(behavior.eventLayer)}
        </span>
      </div>
      <div style={{ marginTop: 4 }}>
        FLAGS:{" "}
        <span style={{ color: "#c8a8e8" }}>
          {formatFlagList(behavior.flags)}
        </span>
      </div>
      <div>
        TRIGGER_EVENTS:{" "}
        <span style={{ color: "#f0e0ff" }}>
          {formatTriggerList(behavior.triggerEvents)}
        </span>
      </div>

      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid rgba(180, 120, 255, 0.18)",
          opacity: 0.85,
        }}
      >
        <div style={{ marginBottom: 4, color: "#e8d0ff" }}>GAIN</div>
        <div>MASTER: {formatGain(gainState.master)}</div>
        <div>AMBIENT: {formatGain(gainState.ambient)}</div>
        <div>SECTION: {formatGain(gainState.section)}</div>
        <div>FOCUS: {formatGain(gainState.focus)}</div>
        <div>EVENT: {formatGain(gainState.event)}</div>
      </div>

      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid rgba(180, 120, 255, 0.18)",
          opacity: 0.85,
        }}
      >
        <div>SECTION: {behavior.activeSection}</div>
        <div>SPECTRUM: {spectrumMode}</div>
        <div>
          COLLAPSED_PROFILE:{" "}
          <span style={{ opacity: 0.75 }}>{collapsedProfile}</span>
        </div>
      </div>

      <div style={{ marginTop: 8, opacity: 0.7 }}>
        toggle: key &quot;B&quot;
      </div>
    </div>
  )
}

