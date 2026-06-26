const STORAGE_KEY = "spatial_sound_debug"

export type SoundDebugState = {
  visible: boolean
}

let debugVisible = false

const listeners = new Set<(state: SoundDebugState) => void>()

function readStoredVisibility(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

function writeStoredVisibility(visible: boolean) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, visible ? "1" : "0")
  } catch {
    /* noop */
  }
}

function emit() {
  const state = getSoundDebugState()
  for (const listener of listeners) {
    listener(state)
  }
}

export function getSoundDebugState(): SoundDebugState {
  return { visible: debugVisible }
}

export function subscribeSoundDebug(
  listener: (state: SoundDebugState) => void
): () => void {
  listeners.add(listener)
  listener(getSoundDebugState())
  return () => {
    listeners.delete(listener)
  }
}

export function toggleSoundDebug(): boolean {
  debugVisible = !debugVisible
  writeStoredVisibility(debugVisible)
  emit()
  return debugVisible
}

export function initSoundDebugFromStorage() {
  debugVisible = readStoredVisibility()
  emit()
}
