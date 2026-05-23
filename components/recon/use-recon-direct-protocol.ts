import { useCallback, useState } from "react"

export type DirectProtocolPhase = "idle" | "viewpoints" | "report"

export function useReconDirectProtocol() {
  const [phase, setPhase] = useState<DirectProtocolPhase>("idle")

  const isActive = phase !== "idle"

  const startProtocol = useCallback(() => {
    setPhase("viewpoints")
  }, [])

  const acknowledgeReport = useCallback(() => {
    setPhase("idle")
  }, [])

  return {
    phase,
    isActive,
    startProtocol,
    acknowledgeReport,
  }
}
