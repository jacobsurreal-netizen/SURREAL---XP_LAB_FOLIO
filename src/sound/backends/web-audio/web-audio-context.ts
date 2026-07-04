export interface WebAudioContextDiagnostics {
  contextState: AudioContextState | "none"
  residentUrlCount: number
  failedUrls: readonly string[]
  pendingLoadCount: number
}

export class WebAudioContextManager {
  private context: AudioContext | null = null
  private readonly bufferCache = new Map<string, AudioBuffer>()
  private readonly bufferLoads = new Map<string, Promise<AudioBuffer | null>>()
  private readonly failedUrls = new Set<string>()
  private readonly loggedFailures = new Set<string>()
  private userGestureUnlocked = false
  private lifecycleHooksInstalled = false

  private readonly onContextStateChange = (): void => {
    this.tryResumeContext()
  }

  private readonly onVisibilityChange = (): void => {
    if (typeof document === "undefined") return
    if (document.visibilityState !== "visible") return
    this.tryResumeContext()
  }

  prepareFromUserGesture(): void {
    this.userGestureUnlocked = true
    const ctx = this.ensureContext()
    if (ctx && ctx.state === "suspended") {
      void ctx.resume()
    }
  }

  ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null
    if (!this.context) {
      this.context = new AudioContext()
      this.installLifecycleHooks()
    }
    return this.context
  }

  createGainNode(): GainNode | null {
    const ctx = this.ensureContext()
    if (!ctx) return null

    const gain = ctx.createGain()
    gain.connect(ctx.destination)
    return gain
  }

  preloadBuffers(urls: readonly string[]): void {
    if (typeof window === "undefined" || urls.length === 0) return

    for (const url of urls) {
      if (this.bufferCache.has(url) || this.failedUrls.has(url)) {
        continue
      }
      void this.loadBuffer(url)
    }
  }

  getDiagnostics(): WebAudioContextDiagnostics {
    return {
      contextState: this.context?.state ?? "none",
      residentUrlCount: this.bufferCache.size,
      failedUrls: [...this.failedUrls],
      pendingLoadCount: this.bufferLoads.size,
    }
  }

  async loadBuffer(url: string): Promise<AudioBuffer | null> {
    if (this.failedUrls.has(url)) {
      return null
    }

    const ctx = this.ensureContext()
    if (!ctx) return null

    const cached = this.bufferCache.get(url)
    if (cached) return cached

    let pending = this.bufferLoads.get(url)
    if (!pending) {
      pending = fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
          return response.arrayBuffer()
        })
        .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
        .then((buffer) => {
          this.bufferCache.set(url, buffer)
          this.bufferLoads.delete(url)
          return buffer
        })
        .catch((error: unknown) => {
          this.bufferLoads.delete(url)
          this.failedUrls.add(url)
          this.logLoadFailure(url, error)
          return null
        })

      this.bufferLoads.set(url, pending)
    }

    return pending
  }

  dispose(): void {
    this.removeLifecycleHooks()

    if (this.context) {
      void this.context.close()
    }

    this.context = null
    this.bufferCache.clear()
    this.bufferLoads.clear()
    this.failedUrls.clear()
    this.loggedFailures.clear()
    this.userGestureUnlocked = false
    this.lifecycleHooksInstalled = false
  }

  private installLifecycleHooks(): void {
    if (this.lifecycleHooksInstalled || typeof window === "undefined") return

    this.context?.addEventListener("statechange", this.onContextStateChange)
    document.addEventListener("visibilitychange", this.onVisibilityChange)
    this.lifecycleHooksInstalled = true
  }

  private removeLifecycleHooks(): void {
    if (!this.lifecycleHooksInstalled || typeof window === "undefined") return

    this.context?.removeEventListener("statechange", this.onContextStateChange)
    document.removeEventListener("visibilitychange", this.onVisibilityChange)
    this.lifecycleHooksInstalled = false
  }

  private tryResumeContext(): void {
    if (!this.userGestureUnlocked || !this.context) return
    if (this.context.state !== "suspended") return
    void this.context.resume()
  }

  private logLoadFailure(url: string, error: unknown): void {
    if (process.env.NODE_ENV !== "development") return
    if (this.loggedFailures.has(url)) return

    const detail =
      error instanceof Error ? error.message : String(error ?? "unknown error")
    console.warn(`[WebAudio] Buffer load failed:\n${url}\n${detail}`)
    this.loggedFailures.add(url)
  }
}
