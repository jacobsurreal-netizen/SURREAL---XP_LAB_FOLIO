"use client"

import { useEffect, useState } from "react"
import type { DebugModuleRegistration } from "./debug-module"

interface DebugModuleHostProps {
  module: DebugModuleRegistration
}

export function DebugModuleHost({ module }: DebugModuleHostProps) {
  const [visible, setVisible] = useState(() => module.isVisible())

  useEffect(() => {
    module.initialize?.()
    setVisible(module.isVisible())
    return module.subscribeVisibility(setVisible)
  }, [module])

  if (!visible) {
    return null
  }

  const Panel = module.Panel
  return <Panel />
}
