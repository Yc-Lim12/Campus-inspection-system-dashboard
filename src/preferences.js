const defaults = {
  textSize: 'default', contrast: false, reducedMotion: false, mapLabels: true,
  announce: true, assistantLanguage: 'auto', dashboardLanguage: 'en', sound: true, severity: 'all',
};

function readStored(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

const legacy = readStored('ci-display-preferences');
export const initialPreferences = {
  ...defaults,
  textSize: legacy.textSize ?? defaults.textSize,
  contrast: legacy.contrast ?? defaults.contrast,
  reducedMotion: legacy.reduceMotion ?? defaults.reducedMotion,
  mapLabels: legacy.mapLabels ?? defaults.mapLabels,
  announce: legacy.announceAlerts ?? defaults.announce,
  assistantLanguage: legacy.replyLanguage ?? defaults.assistantLanguage,
  dashboardLanguage: legacy.dashboardLanguage ?? defaults.dashboardLanguage,
  sound: legacy.alertSound ?? defaults.sound,
  severity: legacy.alertLevel ?? defaults.severity,
};

export function applyDisplayPreferences(preferences) {
  const root = document.documentElement;
  root.dataset.textSize = preferences.textSize;
  root.toggleAttribute('data-high-contrast', preferences.contrast === true);
  root.toggleAttribute('data-reduce-motion', preferences.reducedMotion === true);
  root.toggleAttribute('data-hide-map-labels', preferences.mapLabels === false);
}

export function prefersReducedMotion() {
  return document.documentElement.hasAttribute('data-reduce-motion') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export async function playAlertTone(severity) {
  const context = new AudioContext();
  try {
    await context.resume();
    const high = severity === 'high';
    const notes = high ? [1040, 1040] : severity === 'low' ? [490] : [680, 580];
    const spacing = high ? 0.31 : 0.27;

    notes.forEach((frequency, index) => {
      const tone = context.createOscillator();
      const volume = context.createGain();
      const start = context.currentTime + (high ? 0.015 : 0) + index * spacing;
      tone.type = 'triangle';
      tone.frequency.value = frequency;
      if (high) {
        volume.gain.setValueAtTime(0.001, start);
        volume.gain.linearRampToValueAtTime(0.2, start + 0.008);
        volume.gain.setValueAtTime(0.2, start + 0.20);
        volume.gain.exponentialRampToValueAtTime(0.001, start + 0.24);
      } else {
        volume.gain.setValueAtTime(0.001, start);
        volume.gain.linearRampToValueAtTime(0.14, start + 0.012);
        volume.gain.setValueAtTime(0.14, start + 0.16);
        volume.gain.exponentialRampToValueAtTime(0.001, start + 0.21);
      }
      tone.connect(volume).connect(context.destination);
      if (index === notes.length - 1) tone.onended = () => { void context.close(); };
      tone.start(start);
      tone.stop(start + spacing);
    });
  } catch (error) {
    await context.close();
    throw error;
  }
}
