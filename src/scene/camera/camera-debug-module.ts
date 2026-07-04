import type { DebugModuleRegistration } from "@/src/debug/debug-module"
import { CameraDebugPanel } from "./camera-debug-hud"
import {
  getCameraDebugState,
  subscribeCameraDebug,
  toggleCameraDebug,
} from "./scroll-camera-bridge"

export const cameraDebugModule: DebugModuleRegistration = {
  id: "camera",
  toggleKey: "d",
  isVisible: () => getCameraDebugState().visible,
  subscribeVisibility: (listener) =>
    subscribeCameraDebug((state) => {
      listener(state.visible)
    }),
  toggle: toggleCameraDebug,
  Panel: CameraDebugPanel,
}
