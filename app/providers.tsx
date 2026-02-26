"use client"

import React, { useEffect } from "react"
import { engine as coreEngine } from "@/src/template-kit/engine/core"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    coreEngine.init()
    return () => {
      coreEngine.destroy()
    }
  }, [])

  return <>{children}</>
}