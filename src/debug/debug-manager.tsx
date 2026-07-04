"use client"

import { useEffect, useMemo } from "react"
import { DebugModuleHost } from "./debug-module-host"
import { resolveDebugModules } from "./debug-registry"

export interface DebugManagerProps {
  moduleIds?: readonly string[]
}

function isTypingTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null
  const tag = element?.tagName?.toLowerCase()
  return (
    tag === "input" ||
    tag === "textarea" ||
    Boolean(element?.isContentEditable)
  )
}

export function DebugManager({ moduleIds }: DebugManagerProps) {
  const modules = useMemo(() => resolveDebugModules(moduleIds), [moduleIds])

  useEffect(() => {
    if (modules.length === 0) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isTypingTarget(event.target)) return

      const key = event.key.toLowerCase()
      for (const module of modules) {
        if (key === module.toggleKey.toLowerCase()) {
          module.toggle()
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [modules])

  if (modules.length === 0) {
    return null
  }

  return (
    <>
      {modules.map((module) => (
        <DebugModuleHost key={module.id} module={module} />
      ))}
    </>
  )
}
