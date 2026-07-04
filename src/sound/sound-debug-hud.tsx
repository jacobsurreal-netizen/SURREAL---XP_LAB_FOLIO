"use client"

import { useEffect, useState } from "react"
import { audioRuntime, type AudioDebugSnapshot } from "./audio-runtime"

function formatTriggerList(triggers: readonly string[]): string {
  return triggers.length > 0 ? triggers.join(", ") : "NONE"
}

function formatFlagList(flags: readonly string[]): string {
  return flags.length > 0 ? flags.join(" · ") : "—"
}

function formatLayer(value: string): string {
  return value === "NONE" ? "NONE" : value
}

function formatGain(value: number): string {
  return value.toFixed(2)
}

const EMPTY_SNAPSHOT: AudioDebugSnapshot = {
  soundEnabled: false,
  audibleMix: {
    context: "WORLD",
    ambient: "NONE",
    section: "NONE",
    focus: "NONE",
  },
  backend: null,
  gains: { master: 1, ambient: 1, section: 1, focus: 1, event: 1 },
  semantic: {
    activeSection: "HERO",
    ambientLayer: "NONE",
    sectionLayer: "NONE",
    focusLayer: "NONE",
    eventLayer: "NONE",
    flags: [],
    triggerEvents: [],
    collapsedProfile: "VOID_PROFILE",
    spectrumMode: "COLOR",
  },
}

export function SoundDebugPanel() {
  const [snapshot, setSnapshot] = useState<AudioDebugSnapshot>(
    () => audioRuntime.createDebugSnapshot() ?? EMPTY_SNAPSHOT
  )

  useEffect(() => {
    const refresh = () => {
      const next = audioRuntime.createDebugSnapshot()
      if (next) {
        setSnapshot(next)
      }
    }

    refresh()
    return audioRuntime.subscribeDebugSnapshot(refresh)
  }, [])

  const { semantic, audibleMix, gains, backend } = snapshot

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
        <span style={{ color: "#f0e0ff" }}>{semantic.ambientLayer}</span>
      </div>
      <div>
        SECTION_LAYER:{" "}
        <span style={{ color: "#f0e0ff" }}>
          {formatLayer(semantic.sectionLayer)}
        </span>
      </div>
      <div>
        FOCUS_LAYER:{" "}
        <span style={{ color: "#f0e0ff" }}>
          {formatLayer(semantic.focusLayer)}
        </span>
      </div>
      <div>
        EVENT_LAYER:{" "}
        <span style={{ color: "#f0e0ff" }}>
          {formatLayer(semantic.eventLayer)}
        </span>
      </div>
      <div style={{ marginTop: 4 }}>
        FLAGS:{" "}
        <span style={{ color: "#c8a8e8" }}>
          {formatFlagList(semantic.flags)}
        </span>
      </div>
      <div>
        TRIGGER_EVENTS:{" "}
        <span style={{ color: "#f0e0ff" }}>
          {formatTriggerList(semantic.triggerEvents)}
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
        <div style={{ marginBottom: 4, color: "#e8d0ff" }}>AUDIBLE MIX</div>
        <div>AMBIENT: {formatLayer(audibleMix.ambient)}</div>
        <div>SECTION: {formatLayer(audibleMix.section)}</div>
        <div>FOCUS: {formatLayer(audibleMix.focus)}</div>
        <div>CONTEXT: {audibleMix.context}</div>
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
        <div>MASTER: {formatGain(gains.master)}</div>
        <div>AMBIENT: {formatGain(gains.ambient)}</div>
        <div>SECTION: {formatGain(gains.section)}</div>
        <div>FOCUS: {formatGain(gains.focus)}</div>
        <div>EVENT: {formatGain(gains.event)}</div>
      </div>

      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid rgba(180, 120, 255, 0.18)",
          opacity: 0.85,
        }}
      >
        <div style={{ marginBottom: 4, color: "#e8d0ff" }}>BACKEND</div>
        {backend ? (
          <>
            <div>ID: {backend.backendId}</div>
            {backend.backendId === "web-audio" ? (
              <>
                <div>CONTEXT: {backend.contextState}</div>
                <div>RESIDENT: {backend.residentUrlCount}</div>
                <div>PENDING: {backend.pendingLoadCount}</div>
                <div>
                  FAILED:{" "}
                  {backend.failedUrls.length > 0
                    ? backend.failedUrls.join(", ")
                    : "NONE"}
                </div>
              </>
            ) : null}
          </>
        ) : (
          <div>UNAVAILABLE</div>
        )}
      </div>

      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid rgba(180, 120, 255, 0.18)",
          opacity: 0.85,
        }}
      >
        <div>SECTION: {semantic.activeSection}</div>
        <div>SPECTRUM: {semantic.spectrumMode}</div>
        <div>SOUND_ENABLED: {String(snapshot.soundEnabled)}</div>
        <div>
          COLLAPSED_PROFILE:{" "}
          <span style={{ opacity: 0.75 }}>{semantic.collapsedProfile}</span>
        </div>
      </div>

      <div style={{ marginTop: 8, opacity: 0.7 }}>
        toggle: key &quot;B&quot;
      </div>
    </div>
  )
}

/** @deprecated Use SoundDebugPanel via debug module registration. */
export const SoundDebugHUD = SoundDebugPanel
