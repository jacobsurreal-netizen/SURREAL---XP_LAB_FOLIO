import type { ComponentType } from "react"

/** Lifecycle contract — presentation lives in each module's Panel component. */
export interface DebugModuleRegistration {
  id: string
  toggleKey: string
  isVisible(): boolean
  subscribeVisibility(listener: (visible: boolean) => void): () => void
  toggle(): void
  initialize?(): void
  Panel: ComponentType
}
