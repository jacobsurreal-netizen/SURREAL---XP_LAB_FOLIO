import { cameraDebugModule } from "@/src/scene/camera/camera-debug-module"
import { soundDebugModule } from "@/src/sound/sound-debug-module"
import type { DebugModuleRegistration } from "./debug-module"

const DEBUG_MODULE_REGISTRY: readonly DebugModuleRegistration[] = [
  soundDebugModule,
  cameraDebugModule,
]

const registryById = new Map(
  DEBUG_MODULE_REGISTRY.map((module) => [module.id, module])
)

export function listDebugModuleIds(): string[] {
  return DEBUG_MODULE_REGISTRY.map((module) => module.id)
}

export function resolveDebugModules(
  moduleIds?: readonly string[]
): DebugModuleRegistration[] {
  if (!moduleIds || moduleIds.length === 0) {
    return [...DEBUG_MODULE_REGISTRY]
  }

  return moduleIds
    .map((id) => registryById.get(id))
    .filter((module): module is DebugModuleRegistration => module !== undefined)
}
