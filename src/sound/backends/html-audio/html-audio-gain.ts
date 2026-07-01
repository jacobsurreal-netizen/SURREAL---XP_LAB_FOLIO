/** Preserves pre-gain-architecture output level when all gain values are 1.0. */
const HTML_AUDIO_OUTPUT_CALIBRATION = 0.5

export function toHtmlAudioVolume(effectiveGain: number): number {
  const scaled = effectiveGain * HTML_AUDIO_OUTPUT_CALIBRATION
  return Math.min(1, Math.max(0, scaled))
}
