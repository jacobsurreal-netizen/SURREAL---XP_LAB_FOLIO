// SoundLayer: Non-visual sound state integration (M1)
// Reads engine snapshot for soundEnabled, no audio playback.

import { useEngineSnapshot } from "@/src/template-kit/hooks"

export function SoundLayer() {
  // Read soundEnabled from engine snapshot (M1)
  const snapshot = useEngineSnapshot()
  // No audio playback, just observe state
  return null
}
