"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ReconDirectProtocolOverlay } from "./recon-direct-protocol-overlay"
import { ReconHudComposition } from "./recon-hud-composition"
import { useReconDirectProtocol } from "./use-recon-direct-protocol"

import type { ReconTelemetry } from "./use-recon-telemetry"

interface ReconHUDProps {
  sectorIndex: number
  isMobile?: boolean
  sectorName?: string
  progress?: number
  telemetry?: ReconTelemetry
}

const RECON_AR_URL = "/recon/ar"

function clampSectorIndex(index: number) {
  return Math.min(Math.max(0, index), 2)
}

function HudCornerBrackets({ compact }: { compact?: boolean }) {
  const size = compact ? "w-3 h-3" : "w-4 h-4"
  const colorClass = "text-[color:var(--hud-accent)] opacity-30"

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg className={`absolute top-0 left-0 ${size} ${colorClass}`} viewBox="0 0 16 16">
        <path d="M0 16 V0 H16" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`absolute top-0 right-0 ${size} ${colorClass}`} viewBox="0 0 16 16">
        <path d="M16 16 V0 H0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`absolute bottom-0 left-0 ${size} ${colorClass}`} viewBox="0 0 16 16">
        <path d="M0 0 V16 H16" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`absolute bottom-0 right-0 ${size} ${colorClass}`} viewBox="0 0 16 16">
        <path d="M16 0 V16 H0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  )
}

function HudButtonCorners() {
  const cornerClass = "absolute w-2 h-2 text-[color:var(--hud-accent)] opacity-30"

  return (
    <>
      <svg className={`${cornerClass} top-0 left-0`} viewBox="0 0 8 8" aria-hidden="true">
        <path d="M0 8 V0 H8" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`${cornerClass} top-0 right-0`} viewBox="0 0 8 8" aria-hidden="true">
        <path d="M8 8 V0 H0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`${cornerClass} bottom-0 left-0`} viewBox="0 0 8 8" aria-hidden="true">
        <path d="M0 0 V8 H8" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className={`${cornerClass} bottom-0 right-0`} viewBox="0 0 8 8" aria-hidden="true">
        <path d="M8 0 V8 H0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </>
  )
}

const hudActionBtn =
  "relative border border-[color:var(--hud-accent-dim)] px-4 py-2 font-mono text-xs tracking-[0.18em] text-[color:var(--hud-text)] transition hover:bg-[color:var(--hud-accent-dim)] hover:text-[color:var(--hud-accent)]"

const hudActionBtnDisabled =
  "relative border border-[color:var(--hud-accent-dim)] px-4 py-2 font-mono text-xs tracking-[0.18em] text-[color:var(--hud-text-dim)] opacity-40 cursor-not-allowed"

const hudActionBtnSecondary =
  "relative border border-[color:var(--hud-accent-dim)] px-4 py-2 font-mono text-xs tracking-[0.18em] text-[color:var(--hud-text-dim)] transition hover:bg-[color:var(--hud-accent-dim)] hover:text-[color:var(--hud-accent)]"

type GatewayTransferPhase = "preparing" | "ready"

const TRANSFER_PROTOCOL_LINES = [
  "VALIDATING TOKEN CHANNEL",
  "ALIGNING PROBE ROUTE",
  "STABILIZING AR HANDOFF",
  "TRANSFER LINK READY",
] as const

const TRANSFER_STEP_MS = 450
const TRANSFER_REDUCED_MOTION_MS = 300

interface GatewayModalProps {
  open: boolean
  onClose: () => void
  onStartDirectAnalysis: () => void
}

function GatewayModal({ open, onClose, onStartDirectAnalysis }: GatewayModalProps) {
  const [transferPhase, setTransferPhase] = useState<GatewayTransferPhase>("preparing")
  const [protocolStep, setProtocolStep] = useState(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTransferTimers = useCallback(() => {
    for (const id of timersRef.current) {
      clearTimeout(id)
    }
    timersRef.current = []
  }, [])

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
  }, [])

  useEffect(() => {
    if (!open) {
      clearTransferTimers()
      return
    }

    setTransferPhase("preparing")
    setProtocolStep(0)
    clearTransferTimers()

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reducedMotion) {
      setProtocolStep(TRANSFER_PROTOCOL_LINES.length - 1)
      schedule(() => setTransferPhase("ready"), TRANSFER_REDUCED_MOTION_MS)
      return clearTransferTimers
    }

    for (let i = 1; i < TRANSFER_PROTOCOL_LINES.length; i++) {
      const step = i
      schedule(() => setProtocolStep(step), TRANSFER_STEP_MS * step)
    }

    schedule(() => setTransferPhase("ready"), TRANSFER_STEP_MS * TRANSFER_PROTOCOL_LINES.length)

    return clearTransferTimers
  }, [open, clearTransferTimers, schedule])

  useEffect(() => clearTransferTimers, [clearTransferTimers])

  if (!open) return null

  const isReady = transferPhase === "ready"

  const statusRows = isReady
    ? ([
        { label: "GATEWAY", value: "READY" },
        { label: "PROBE", value: "STANDBY" },
        { label: "TRACKING", value: "OFFLINE" },
      ] as const)
    : ([
        { label: "GATEWAY", value: "NEGOTIATING" },
        { label: "PROBE", value: "STANDBY" },
        { label: "TRACKING", value: "OFFLINE" },
      ] as const)

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[120] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-label="RECON AR transfer modal"
    >
      <div
        className="relative w-full max-w-md border border-[#00ac6c]/20 bg-[#040b0a]/90 backdrop-blur-md p-5 sm:p-6"
        style={{ boxShadow: "0 0 40px color-mix(in srgb, var(--hud-glow) 35%, transparent)" }}
      >
        <HudCornerBrackets />

        <div className="mb-4 font-mono text-[length:clamp(0.6rem,2vw,0.7rem)] tracking-[0.26em] text-[color:var(--hud-text-dim)]">
          {isReady ? "[ TRANSFER SESSION TO MOBILE PROBE ]" : "[ PREPARING TRANSFER ]"}
        </div>

        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--hud-text)] opacity-90">
          Observation Deck → Diagnostic Probe handoff
        </p>

        {!isReady && (
          <div className="mb-4 space-y-2 font-mono text-[9px] tracking-[0.2em] text-[color:var(--hud-text-dim)]">
            <p className="text-[color:var(--hud-accent)] opacity-80">PROBE CHANNEL NEGOTIATING</p>
            <p>
              ROUTE LOCKING:{" "}
              <span className="text-[color:var(--hud-text)] tabular-nums">{RECON_AR_URL}</span>
            </p>
            <ul className="space-y-1.5 pt-1">
              {TRANSFER_PROTOCOL_LINES.map((line, index) => {
                const isActive = index === protocolStep
                const isComplete = index < protocolStep
                return (
                  <li
                    key={line}
                    className={
                      isActive
                        ? "text-[color:var(--hud-accent)] opacity-100"
                        : isComplete
                          ? "opacity-50"
                          : "opacity-25"
                    }
                  >
                    {line}
                  </li>
                )
              })}
            </ul>
            <p className="pt-1 opacity-70">PHYSICAL TOKEN REQUIRED</p>
          </div>
        )}

        {isReady && (
          <div className="recon-transfer-active relative mb-4 bg-black/40 px-4 py-4">
            <HudCornerBrackets compact />
            <div className="space-y-3 text-center font-mono">
              <p className="text-[10px] tracking-[0.28em] text-[color:var(--hud-accent)]">
                [ TRANSFER LINK READY ]
              </p>
              <p className="text-[9px] tracking-[0.22em] text-[color:var(--hud-text-dim)]">
                MOBILE PROBE ENDPOINT
              </p>
              <p
                className="break-all text-[length:clamp(0.65rem,2.5vw,0.8rem)] tracking-[0.14em] text-[color:var(--hud-text)] tabular-nums"
                style={{
                  textShadow: "0 0 10px color-mix(in srgb, var(--hud-glow) 35%, transparent)",
                }}
              >
                {RECON_AR_URL}
              </p>
              <p className="text-[9px] tracking-[0.2em] text-[color:var(--hud-text-dim)]">
                SCAN ROUTE: {RECON_AR_URL}
              </p>
            </div>
          </div>
        )}

        <div className="mb-5 space-y-1.5 px-1 py-2">
          {statusRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between font-mono text-[9px] tracking-[0.18em]"
            >
              <span className="text-[color:var(--hud-text-dim)]">{row.label}</span>
              <span className="text-[color:var(--hud-accent)] tabular-nums">{row.value}</span>
            </div>
          ))}
        </div>

        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--hud-text-dim)]">
          {isReady
            ? "Open mobile scanner to continue recon on probe route"
            : "Awaiting transfer link stabilization"}
        </p>

        {isReady && (
          <p className="mb-4 space-y-1 font-mono text-[8px] leading-relaxed tracking-[0.14em] text-[color:var(--hud-text-dim)] opacity-60">
            <span className="block">DESKTOP OBSERVATION RETURNS PARTIAL STRUCTURAL DATA.</span>
            <span className="block">PHYSICAL TOKEN REQUIRED FOR OPTICAL ALIGNMENT.</span>
          </p>
        )}

        <div className="flex flex-col gap-3">
          {isReady ? (
            <>
              <a href={RECON_AR_URL} className={`${hudActionBtn} text-center`}>
                <HudButtonCorners />
                &gt; OPEN_MOBILE_SCANNER
              </a>
              <button
                type="button"
                onClick={() => {
                  onStartDirectAnalysis()
                  onClose()
                }}
                className={`${hudActionBtnSecondary} text-center`}
              >
                <HudButtonCorners />
                &gt; RUN_DIRECT_ANALYSIS
              </button>
            </>
          ) : (
            <>
              <span
                className={`${hudActionBtnDisabled} pointer-events-none text-center`}
                aria-disabled="true"
              >
                <HudButtonCorners />
                &gt; OPEN_MOBILE_SCANNER
              </span>
              <span
                className={`${hudActionBtnDisabled} pointer-events-none text-center`}
                aria-disabled="true"
              >
                <HudButtonCorners />
                &gt; RUN_DIRECT_ANALYSIS
              </span>
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            className={`${hudActionBtn} text-center text-[color:var(--hud-text-dim)]`}
          >
            <HudButtonCorners />
            &gt; CLOSE_CHANNEL
          </button>
        </div>
      </div>
    </div>
  )
}

export function ReconHUD({ sectorIndex, isMobile, sectorName, progress = 0, telemetry }: ReconHUDProps) {
  const safeSectorIndex = clampSectorIndex(sectorIndex)
  const mode = isMobile ? "mobile" : "desktop"
  const [isGatewayOpen, setIsGatewayOpen] = useState(false)
  const {
    phase: directProtocolPhase,
    isActive: isDirectProtocolActive,
    visitedSectors: directVisitedSectors,
    sectorLabels: directSectorLabels,
    resonanceProgress: directResonanceProgress,
    decodeStep: directDecodeStep,
    startProtocol,
    acknowledgeReport,
    onResonanceHoldStart,
    onResonanceHoldEnd,
    confirmViewport,
  } = useReconDirectProtocol({ sectorIndex: safeSectorIndex, mode })

  useEffect(() => {
    if (safeSectorIndex !== 2) {
      setIsGatewayOpen(false)
    }
  }, [safeSectorIndex])

  return (
    <>
      <style>{`
        @keyframes recon-hud-primary-bloom {
          0%,
          100% {
            text-shadow:
              0 0 6px color-mix(in srgb, var(--hud-glow) 45%, transparent),
              0 0 1px color-mix(in srgb, var(--hud-accent) 30%, transparent);
          }
          50% {
            text-shadow:
              0 0 12px color-mix(in srgb, var(--hud-glow) 65%, transparent),
              0 0 3px color-mix(in srgb, var(--hud-accent) 40%, transparent);
          }
        }

        @keyframes recon-hud-primary-glitch {
          0%,
          96%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          97% {
            transform: translate3d(0.6px, 0, 0);
          }
          98% {
            transform: translate3d(-0.6px, 0, 0);
          }
        }

        .recon-hud-primary-line {
          animation:
            recon-hud-primary-bloom 5s ease-in-out infinite,
            recon-hud-primary-glitch 9s steps(1, end) infinite;
        }

        @keyframes recon-transfer-active {
          0%,
          100% {
            border-color: color-mix(in srgb, var(--hud-accent) 18%, transparent);
            box-shadow: inset 0 0 12px color-mix(in srgb, var(--hud-glow) 10%, transparent);
          }
          50% {
            border-color: color-mix(in srgb, var(--hud-accent) 42%, transparent);
            box-shadow: inset 0 0 22px color-mix(in srgb, var(--hud-glow) 24%, transparent);
          }
        }

        .recon-transfer-active {
          border: 1px solid color-mix(in srgb, var(--hud-accent) 18%, transparent);
          animation: recon-transfer-active 2.6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .recon-hud-primary-line {
            animation: none;
            text-shadow: 0 0 8px color-mix(in srgb, var(--hud-glow) 50%, transparent);
          }

          .recon-transfer-active {
            animation: none;
          }
        }
      `}</style>

      {/*
        Mobile sector 2: direct AR link replaces modal (no pointer-events issue on mobile).
        The composition's bottom strip carries the status. No card rendered.
      */}
      {isMobile && safeSectorIndex === 2 && !isDirectProtocolActive && (
        <div className="pointer-events-auto absolute bottom-[16vh] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2">
          <a
            href={RECON_AR_URL}
            className="recon-life-armed group relative min-w-[min(88vw,16rem)] border border-[color:var(--hud-accent)] bg-transparent px-5 py-2.5 text-center font-mono transition duration-200 hover:bg-[color:var(--hud-accent-dim)]"
            style={{
              boxShadow:
                "0 0 0 1px color-mix(in srgb, var(--hud-accent-dim) 50%, transparent), 0 0 16px color-mix(in srgb, var(--hud-glow) 16%, transparent)",
            }}
          >
            <HudButtonCorners />
            <span className="relative block text-[length:clamp(0.68rem,3.5vw,0.82rem)] font-medium tracking-[0.18em] text-[color:var(--hud-accent)]">
              &gt; ACTIVATE_SCANNER
            </span>
          </a>
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={startProtocol}
              className="group relative min-w-[min(88vw,16rem)] border border-[color:var(--hud-accent-dim)] bg-transparent px-5 py-2.5 text-center font-mono transition duration-200 hover:bg-[color:var(--hud-accent-dim)] hover:text-[color:var(--hud-accent)]"
            >
              <HudButtonCorners />
              <span className="relative block text-[length:clamp(0.68rem,3.5vw,0.82rem)] font-medium tracking-[0.18em] text-[color:var(--hud-text)]">
                &gt; RUN_DIRECT_ANALYSIS
              </span>
            </button>
            <span className="font-mono text-[7px] tracking-[0.22em] text-[color:var(--hud-text-dim)] opacity-70">
              PARTIAL OBSERVATION PROTOCOL
            </span>
          </div>
          <span className="font-mono text-[7px] tracking-[0.22em] text-[color:var(--hud-text-dim)] opacity-70">
            PHYSICAL TOKEN REQUIRED
          </span>
        </div>
      )}

      <div className="absolute inset-0 z-30 pointer-events-none">
        <ReconHudComposition
          sectorIndex={safeSectorIndex}
          isMobile={isMobile}
          sectorName={sectorName}
          progress={progress}
          onRequestArLink={!isMobile ? () => setIsGatewayOpen(true) : undefined}
          suppressGatewayCommand={isDirectProtocolActive}
          telemetry={telemetry}
          gatewayModalOpen={!isMobile && isGatewayOpen}
        />
      </div>

      {!isMobile && (
        <GatewayModal
          open={isGatewayOpen}
          onClose={() => setIsGatewayOpen(false)}
          onStartDirectAnalysis={startProtocol}
        />
      )}

      {isDirectProtocolActive && (
        <ReconDirectProtocolOverlay
          phase={directProtocolPhase}
          visitedSectors={directVisitedSectors}
          sectorLabels={directSectorLabels}
          resonanceProgress={directResonanceProgress}
          decodeStep={directDecodeStep}
          onAcknowledge={acknowledgeReport}
          onResonanceHoldStart={onResonanceHoldStart}
          onResonanceHoldEnd={onResonanceHoldEnd}
          mode={mode}
          confirmViewport={confirmViewport}
        />
      )}
    </>
  )
}
