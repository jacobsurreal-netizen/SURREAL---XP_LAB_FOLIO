export type QualityTier = 'HIGH' | 'MEDIUM' | 'LOW';

export class SDIMonitor {
    private fps: number = 60;
    private quality: QualityTier = 'HIGH';
    private frameCount: number = 0;
    private lastTime: number = typeof performance !== 'undefined' ? performance.now() : 0;
    private dpr: number = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

    // Hysteresis configuration
    private thresholdLow = 30;
    private thresholdHigh = 55;
    private sustainedDrops = 0;
    private readonly dropTolerance = 60; // frames before dropping quality
    private rAFId: number | null = null;

    private listeners: Set<(q: QualityTier, fps: number, dpr: number) => void> = new Set();

    public start() {
        if (typeof window === 'undefined') return;
        if (this.rAFId !== null) return;
        this.lastTime = performance.now();
        this.tick();
    }

    public stop() {
        if (this.rAFId !== null) {
            cancelAnimationFrame(this.rAFId);
            this.rAFId = null;
        }
    }

    private tick = () => {
        this.frameCount++;
        const now = performance.now();
        const delta = now - this.lastTime;

        if (delta >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / delta);
            this.frameCount = 0;
            this.lastTime = now;
            this.evaluateQuality();
            this.notify();
        }
        this.rAFId = window.requestAnimationFrame(this.tick);
    }

    private evaluateQuality() {
        if (this.fps < this.thresholdLow && this.quality !== 'LOW') {
            this.sustainedDrops++;
            if (this.sustainedDrops > this.dropTolerance / 60) {
                // downgrade
                this.quality = this.quality === 'HIGH' ? 'MEDIUM' : 'LOW';
                this.dpr = this.quality === 'MEDIUM' ? 1 : 0.75;
                this.logPerformance(`Downgrading quality to ${this.quality} (FPS drops: ${this.fps})`);
                this.sustainedDrops = 0;
            }
        } else if (this.fps > this.thresholdHigh && this.quality !== 'HIGH') {
            // Only upgrade if we consistently have high FPS
            // Hysteresis prevents rapid toggling
            this.sustainedDrops--;
            if (this.sustainedDrops < -3) { // 3 seconds of solid FPS
                this.quality = this.quality === 'LOW' ? 'MEDIUM' : 'HIGH';
                this.dpr = this.quality === 'MEDIUM' ? 1 : Math.min(window.devicePixelRatio, 2);
                this.logPerformance(`Upgrading quality to ${this.quality} (FPS solid: ${this.fps})`);
                this.sustainedDrops = 0;
            }
        } else {
            // stabilize
            if (this.sustainedDrops > 0) this.sustainedDrops--;
            if (this.sustainedDrops < 0) this.sustainedDrops++;
        }
    }

    private logPerformance(msg: string) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[SDI] ${msg} | DPR: [${this.dpr}]`);
        }
    }

    private notify() {
        this.listeners.forEach(listener => listener(this.quality, this.fps, this.dpr));
    }

    public subscribe(listener: (q: QualityTier, fps: number, dpr: number) => void) {
        this.listeners.add(listener);
        // invoke immediately
        listener(this.quality, this.fps, this.dpr);
        return () => this.listeners.delete(listener);
    }

    public getSnapshot() {
        return { fps: this.fps, quality: this.quality, dpr: this.dpr };
    }
}

export const sdi = new SDIMonitor();
