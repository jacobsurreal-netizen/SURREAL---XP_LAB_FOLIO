/** True when an in-flight async start must abort without touching newer playback. */
export function isPlaybackSessionAborted(
  silenced: boolean,
  isSessionCurrent: () => boolean
): boolean {
  return silenced || !isSessionCurrent()
}
