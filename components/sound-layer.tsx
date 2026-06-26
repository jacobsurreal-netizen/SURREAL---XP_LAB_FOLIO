"use client"

import { useEffect, useRef } from "react"
import { collapseActiveProfile } from "@/src/sound/behavior-mapper"
import { SoundDebugHUD } from "@/src/sound/sound-debug-hud"
import { useSoundBehaviorState } from "@/src/sound/use-sound-behavior"

export function SoundLayer() {
  const state = useSoundBehaviorState()
  const previousProfileRef = useRef<string | null>(null)
  const collapsedProfile = collapseActiveProfile(state)

  useEffect(() => {
    if (collapsedProfile === previousProfileRef.current) return

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[SoundLayer] Collapsed profile: ${previousProfileRef.current ?? "NONE"} -> ${collapsedProfile}`,
        {
          section: state.activeSection,
          layers: {
            ambient: state.ambientLayer,
            section: state.sectionLayer,
            focus: state.focusLayer,
            event: state.eventLayer,
          },
          triggerEvents: state.triggerEvents,
          flags: state.flags,
        }
      )
    }

    previousProfileRef.current = collapsedProfile
  }, [state, collapsedProfile])

  return <SoundDebugHUD behavior={state} />
}
