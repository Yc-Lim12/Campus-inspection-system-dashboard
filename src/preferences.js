const KEY = 'ci-display-preferences';
const DEFAULTS = {
  textSize: 'default',
  contrast: false,
  reduceMotion: false,
  mapLabels: true,
  announceAlerts: true,
  alertSound: true,
  alertLevel: 'all',
};

let preferences = { ...DEFAULTS };
try {
  preferences = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) };
} catch {
  // The demo still works when browser storage is unavailable.
}

export function readPreferences() {
  return preferences;
}

export function applyDisplayPreferences() {
  const root = document.documentElement;
  root.dataset.textSize = preferences.textSize;
  root.toggleAttribute('data-high-contrast', preferences.contrast === true);
  root.toggleAttribute('data-reduce-motion', preferences.reduceMotion === true);
  root.toggleAttribute('data-hide-map-labels', preferences.mapLabels === false);
}

export function updatePreference(key, value) {
  preferences = { ...preferences, [key]: value };
  applyDisplayPreferences();

  try {
    localStorage.setItem(KEY, JSON.stringify(preferences));
  } catch {
    // Keep the selected settings applied for the current page session.
  }
  return preferences;
}

export function prefersReducedMotion() {
  return preferences.reduceMotion === true || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
