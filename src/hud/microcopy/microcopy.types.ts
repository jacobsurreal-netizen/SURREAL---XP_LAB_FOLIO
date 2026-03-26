export type HUDMicrocopyContext = {
  mode: "COLOR" | "IR" | "SCAN"
  state: "IDLE" | "HOVER" | "FOCUS" | "ACTIVE" | "CTA" | "GATEWAY"
  sector: "HERO" | "ABOUT" | "PROJECTS" | "CTA"
}

export type HUDMicrocopySlot = {
  primary: string
  secondary?: string
}