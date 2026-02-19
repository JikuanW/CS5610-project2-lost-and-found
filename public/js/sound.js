// Audio feedback helpers

let audioCtx = null;

/**
 * Ensure AudioContext exists and is running.
 */
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play one beep.
 */
function beep(freq, durationSec) {
  const ctx = getAudioCtx();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = freq;

  // Low volume
  gain.gain.value = 0.04;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + durationSec);
}

/**
 * Success sound
 */
export function playSuccess() {
  beep(660, 0.08);
  setTimeout(() => beep(880, 0.08), 90);
}

/**
 * Error sound
 */
export function playError() {
  beep(220, 0.16);
}
