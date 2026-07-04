/** True when the element is actively outputting (or scheduled to output) audio. */
export function isHtmlElementAudible(player: HTMLAudioElement | null): boolean {
  if (!player) return false
  if (player.paused || player.ended) return false
  if (player.error) return false

  const src = player.currentSrc || player.src
  if (!src) return false

  return true
}
