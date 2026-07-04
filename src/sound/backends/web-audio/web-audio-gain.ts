/** Matches HTML backend output level for identical loudness at default gains. */
const WEB_AUDIO_OUTPUT_CALIBRATION = 0.5

export function calibrateWebAudioGain(effectiveGain: number): number {
  const scaled = effectiveGain * WEB_AUDIO_OUTPUT_CALIBRATION
  return Math.min(1, Math.max(0, scaled))
}
