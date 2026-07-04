export type LoopChannelKind = "ambient" | "section"

const FOCUS_ACTIVE_LABEL = "IR + SCAN"

function formatAmbientLabel(layer: string): string {
  switch (layer) {
    case "VOID_PROFILE":
      return "VOID"
    case "IR_PROFILE":
      return "IR"
    case "NONE":
      return "NONE"
    default:
      return layer
  }
}

function formatSectionLabel(layer: string): string {
  switch (layer) {
    case "EXPLORATION_PROFILE":
      return "EXPLORATION"
    case "IR_EXPLORATION_PROFILE":
      return "IR_EXPLORATION"
    case "CTA_PROFILE":
      return "CTA"
    case "NONE":
      return "NONE"
    default:
      return layer
  }
}

function formatLoopLabel(channel: LoopChannelKind, layer: string): string {
  return channel === "ambient" ? formatAmbientLabel(layer) : formatSectionLabel(layer)
}

export function logLoopToNone(channel: LoopChannelKind, previous: string | null): void {
  if (!previous || previous === "NONE") return

  const label = formatLoopLabel(channel, previous)
  if (channel === "ambient") {
    console.info(`[Audio Runtime]\nAmbient\n${label} → NONE`)
    return
  }

  console.info(`[Audio Runtime]\nSection\n${label} → NONE`)
}

export function logLoopSwap(
  channel: LoopChannelKind,
  previous: string | null,
  next: string
): void {
  if (channel === "ambient") {
    if (previous && previous !== next) {
      console.info(
        `[Audio Runtime]\nAmbient\n${formatAmbientLabel(previous)} → ${formatAmbientLabel(next)}`
      )
    }
    return
  }

  if (previous !== next) {
    console.info(
      `[Audio Runtime]\nSection\n${formatSectionLabel(previous ?? "NONE")} → ${formatSectionLabel(next)}`
    )
  }
}

export function logFocusToNone(): void {
  console.info(`[Audio Runtime]\nFocus\n${FOCUS_ACTIVE_LABEL} → NONE`)
}

export function logFocusToActive(): void {
  console.info(`[Audio Runtime]\nFocus\nNONE → ${FOCUS_ACTIVE_LABEL}`)
}

export function logEventTrigger(trigger: string, assetName: string): void {
  console.info(`[Event Runtime]\nTrigger ${trigger} → ${assetName}`)
}
