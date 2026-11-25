import React from 'react';
import { CHECKPOINT_ROOMS } from './inspectionRecords.js';
import { RESPONSE_HOURS } from './incidents.js';

export const initialCheckpoints = Object.entries(CHECKPOINT_ROOMS).map(([id, room], index) => ({
  id,
  room,
  location: ['West wing corridor', 'Central corridor', 'Central corridor, east', 'East wing, by the lift'][index],
  active: true,
  photo: true,
}));

export const initialConfiguration = {
  checkpoints: initialCheckpoints,
  limits: { temperatureMin: 23, temperatureMax: 26, humidityMin: 40, humidityMax: 70, pm25: 35, gas: 30 },
  checkpointLimits: {},
  responseHours: RESPONSE_HOURS,
  patrols: ['09:55', '14:00', '18:30'].map((time, index) => ({
    id: index + 1, time, name: ['Morning', 'Afternoon', 'After classes'][index], days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], active: true,
  })),
  people: [],
  zones: [
    { id: 1, name: 'Staffroom', rule: 'No photography' },
    { id: 2, name: 'Toilets, both wings', rule: 'No entry' },
  ],
  retentionHours: 24,
  healthCheckedAt: null,
  changes: [],
};

const samplePeople = [
  { email: 'admin@example.invalid', label: 'Demo administrator', role: 'Administrator' },
  { email: 'staff.a@example.invalid', label: 'Demo facility staff A', role: 'Facility staff' },
  { email: 'staff.b@example.invalid', label: 'Demo facility staff B', role: 'Facility staff' },
];

export function withConfigurationDefaults(saved) {
  return {
    ...initialConfiguration, ...saved,
    limits: { ...initialConfiguration.limits, ...saved.limits },
    responseHours: { ...RESPONSE_HOURS, ...saved.responseHours },
    people: [...samplePeople.filter(sample => !saved.people?.some(person => person.email === sample.email)), ...(saved.people || [])],
  };
}

export function limitsForCheckpoint(configuration, checkpoint) {
  return { ...configuration.limits, ...configuration.checkpointLimits?.[checkpoint] };
}

export const initialRobot = { mode: 'patrol', destination: 'CP3', position: 'CP2', updated: null };
export const robotLabels = {
  patrol: 'On patrol', outbound: 'En route', returning: 'Returning to dock',
  stopped: 'Stopped', arrived: 'At checkpoint', docked: 'Docked',
};

const campusTimeFormats = new Map();

export function campusTime(timestamp, language = 'en') {
  if (!campusTimeFormats.has(language)) {
    const locale = language === 'ms' ? 'ms-MY' : language === 'zh' ? 'zh-MY' : 'en-GB';
    campusTimeFormats.set(language, new Intl.DateTimeFormat(locale, {
      timeZone: 'Asia/Kuala_Lumpur', dateStyle: 'medium', timeStyle: 'short', hourCycle: 'h23',
    }));
  }
  return campusTimeFormats.get(language).format(timestamp);
}

const campusDateFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit',
});

export function campusDate(date) {
  const fields = Object.fromEntries(campusDateFormat.formatToParts(date).map(({ type, value }) => [type, value]));
  return fields.year + '-' + fields.month + '-' + fields.day;
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function useStoredState(key, initialValue) {
  const [value, setValue] = React.useState(() => readStorage(key, initialValue));
  const latest = React.useRef(value);

  React.useEffect(() => {
    function sync(event) {
      if (event.storageArea !== localStorage || (event.key !== key && event.key !== null)) return;
      latest.current = readStorage(key, initialValue);
      setValue(latest.current);
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [key, initialValue]);

  const update = React.useCallback(action => {
    const previous = readStorage(key, latest.current);
    const next = typeof action === 'function' ? action(previous) : action;
    latest.current = next;
    try {
      if (next !== previous) localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Keep the updated value in this tab when storage is unavailable.
    }
    setValue(next);
  }, [key]);

  return [value, update];
}

export function checkpointLabel(checkpoints, id) {
  const checkpoint = checkpoints.find(item => item.id === id);
  return checkpoint ? checkpoint.id + ' · ' + checkpoint.room : id;
}

export function robotDestinationLabel(configuration, robot, t = text => text) {
  if (robot.mode === 'stopped') return t('Patrol paused');
  if (robot.mode === 'docked') return t('At charging dock');
  if (robot.mode === 'returning') return t('Heading to the charging dock');
  const destination = checkpointLabel(configuration.checkpoints, robot.destination);
  return robot.mode === 'arrived' ? destination : t('Heading to') + ' ' + destination;
}

export function reachableCheckpoints(configuration) {
  return configuration.checkpoints.filter(item => item.active &&
    !configuration.zones.some(zone => zone.checkpoint === item.id && zone.rule === 'No entry'));
}

export function canRequestPhoto(configuration, robot) {
  const position = robot.position;
  if (!position) return false;
  return configuration.checkpoints.some(item => item.id === position && item.active && item.photo) &&
    !configuration.zones.some(zone => zone.checkpoint === position);
}
