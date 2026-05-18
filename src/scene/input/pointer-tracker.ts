export type PointerState = {
  x: number
  y: number
}

export function createPointerTracker(container: HTMLElement) {
  const pointer = { x: 0, y: 0 }
  const smoothedPointer = { x: 0, y: 0 }

  const onMouseMove = (event: MouseEvent) => {
    const rect = container.getBoundingClientRect()
    const localX = (event.clientX - rect.left) / rect.width
    const localY = (event.clientY - rect.top) / rect.height

    const targetX = localX * 2 - 1
    const targetY = -(localY * 2 - 1)

    pointer.x = Math.max(-0.45, Math.min(0.45, targetX))
    pointer.y = Math.max(-0.30, Math.min(0.30, targetY))
  }

  const onMouseLeave = () => {
    pointer.x = 0
    pointer.y = 0
  }

  const attach = () => {
    window.addEventListener("mousemove", onMouseMove)
    container.addEventListener("mouseleave", onMouseLeave)
  }

  const update = (lerpFactor = 0.065) => {
    smoothedPointer.x += (pointer.x - smoothedPointer.x) * lerpFactor
    smoothedPointer.y += (pointer.y - smoothedPointer.y) * lerpFactor

    return smoothedPointer
  }

  const dispose = () => {
    window.removeEventListener("mousemove", onMouseMove)
    container.removeEventListener("mouseleave", onMouseLeave)
  }

  return {
    pointer,
    smoothedPointer,
    attach,
    update,
    dispose,
  }
}