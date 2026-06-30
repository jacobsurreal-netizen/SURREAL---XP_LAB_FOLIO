"use client"

import { useEffect } from "react"
import { useSound } from "@/src/template-kit/hooks"
import { audioRuntime } from "./audio-runtime"
import type { SoundBehaviorState } from "./types"

export function useAudioRuntime(state: SoundBehaviorState): void {
  const { soundEnabled } = useSound()

  useEffect(() => {
    audioRuntime.applyState(state, soundEnabled)
  }, [state, soundEnabled])

  useEffect(() => {
    audioRuntime.applyTriggerEvents(state.triggerEvents, soundEnabled)
  }, [state.triggerEvents, soundEnabled])

  useEffect(() => {
    return () => {
      audioRuntime.dispose()
    }
  }, [])
}
