import type { DebugModuleRegistration } from "@/src/debug/debug-module"
import { SoundDebugPanel } from "./sound-debug-hud"
import {
  getSoundDebugState,
  initSoundDebugFromStorage,
  subscribeSoundDebug,
  toggleSoundDebug,
} from "./sound-debug-store"

export const soundDebugModule: DebugModuleRegistration = {
  id: "sound",
  toggleKey: "b",
  isVisible: () => getSoundDebugState().visible,
  subscribeVisibility: (listener) =>
    subscribeSoundDebug((state) => {
      listener(state.visible)
    }),
  toggle: toggleSoundDebug,
  initialize: initSoundDebugFromStorage,
  Panel: SoundDebugPanel,
}
