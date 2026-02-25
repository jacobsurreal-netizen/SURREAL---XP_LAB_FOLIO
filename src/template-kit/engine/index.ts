// ──────────────────────────────────────────────────────────────
// template-kit / engine / index.ts
// Public engine API (template-safe).
// Stabilizes naming used by hooks: getSnapshot + subscribe + dispatch.
// Fixes lost `this` context (core uses this._snapshotListeners).
// ──────────────────────────────────────────────────────────────

import { engine as coreEngine } from "./core"

type DispatchFn = (type: string, payload?: any) => void
type SubscribeFn = (listener: () => void) => () => void
type GetSnapshotFn = () => any

const getSnapshot: GetSnapshotFn = () => {
  const ce: any = coreEngine as any

  const fn =
    ce.getSnapshot ??
    ce.getState ??
    ce.snapshot ??
    ce.state ??
    null

  // If it's a method, preserve `this`
  if (typeof fn === "function") return fn.call(ce)
  if (fn != null) return fn

  return {}
}

const subscribe: SubscribeFn = (cb: () => void) => {
  const ce: any = coreEngine as any
  const coreSubscribe = ce.subscribe

  if (typeof coreSubscribe !== "function") {
    return () => {}
  }

  // Core might call listeners with args; React wants cb():void
  // IMPORTANT: preserve `this` => call(coreEngine, ...)
  const unsubscribe = coreSubscribe.call(ce, (..._args: any[]) => cb())

  return typeof unsubscribe === "function" ? unsubscribe : () => {}
}

const dispatch: DispatchFn = (type: string, payload?: any) => {
  const ce: any = coreEngine as any

  const fn =
    ce.dispatch ??
    ce.dispatchCommand ??
    ce.emit ??
    null

  if (typeof fn === "function") {
    // preserve `this`
    return fn.call(ce, type, payload)
  }

  throw new Error(
    `[engine] Missing dispatch() in core engine. Tried dispatch/dispatchCommand/emit. Command: ${type}`
  )
}

export const engine: {
  getSnapshot: GetSnapshotFn
  subscribe: SubscribeFn
  dispatch: DispatchFn
} & typeof coreEngine = {
  ...(coreEngine as any),
  getSnapshot,
  subscribe,
  dispatch,
}

export * from "./types"
export {
  sectors,
  defaultSettings,
  accessibility,
  spectrumTokens,
  dictionary,
} from "./config"