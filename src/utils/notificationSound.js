/**
 * Plays a pleasant notification chime using the Web Audio API.
 * No external audio file needed — synthesizes the sound in real-time.
 */
export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    // 👇 Two-tone chime (C6 → E6) for a pleasant "ding-dong"
    const now = ctx.currentTime;

    const playTone = (frequency, startTime, duration, volume = 0.15) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, startTime);

      // Smooth attack & decay (no clicks)
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // First note: high C
    playTone(1046.50, now, 0.25, 0.15);
    // Second note: E (musical fifth above) — makes it sound pleasant
    playTone(1318.51, now + 0.12, 0.35, 0.12);

    // Clean up
    setTimeout(() => ctx.close(), 1500);
  } catch (error) {
    // Fail silently — sound is a nice-to-have
    console.warn('Could not play notification sound:', error);
  }
};