/** Invalidates in-flight async playback starts when bumped or invalidated. */
export class AsyncSession {
  private generation = 0

  bump(): number {
    this.generation += 1
    return this.generation
  }

  invalidate(): void {
    this.generation += 1
  }

  isCurrent(token: number): boolean {
    return token === this.generation
  }
}
