// useSound: Hook for soundEnabled state (M1)
import { useEngineSnapshot } from "./use-engine-snapshot"

export function useSound() {
  const snapshot = useEngineSnapshot()
  return {
    soundEnabled: snapshot.soundEnabled,
  }
}
