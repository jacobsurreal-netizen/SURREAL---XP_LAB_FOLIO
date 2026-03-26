import { HUDMicrocopyContext, HUDMicrocopySlot } from "./microcopy.types"

export function resolveMicrocopy(ctx: HUDMicrocopyContext): HUDMicrocopySlot {
  const { state, sector, mode } = ctx

  // CTA priority
  if (state === "CTA") {
    return mode === "IR"
      ? { primary: "CONTACT SIGNAL" }
      : { primary: "INITIATE CONTACT", secondary: "TRANSMISSION READY" }
  }

  if (state === "FOCUS") {
    return {
      primary: "FOCUS LOCK",
      secondary: `SECTOR: ${sector}`,
    }
  }

  if (state === "HOVER") {
    return {
      primary: "SIGNAL DETECTED",
    }
  }

  return {
    primary: "SYSTEM READY",
  }
}