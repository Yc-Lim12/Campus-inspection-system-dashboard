export const INCIDENT_LABELS = {
  detected: 'Detected', acknowledged: 'Acknowledged', reported: 'Reported', on_hold: 'On hold', resolved: 'Resolved',
};

export const RESPONSE_HOURS = { High: 4, Medium: 24, Low: 72 };
export const SAMPLE_NOW = Date.parse('2026-11-20T10:42:00+08:00');
export const SAMPLE_WATER_PHOTO = './assets/sample-water-leak.jpg';

const rows = [
  ['INC-0231', 'Water leak or stain', 'CP1', 'UW-8-5', '2026-11-20', '10:12', 'High', 'detected', 0.86],
  ['INC-0230', 'PM2.5 above limit', 'CP2', 'UC-8-8', '2026-11-20', '10:31', 'Medium', 'reported', null, 41],
  ['INC-0229', 'Minor floor obstruction', 'CP4', 'UC-8-11', '2026-11-19', '16:37', 'Low', 'acknowledged', 0.79],
  ['INC-0228', 'Floor obstruction', 'CP4', 'UC-8-11', '2026-11-19', '16:05', 'Medium', 'resolved'],
  ['INC-0226', 'Wall crack', 'CP3', 'UC-8-10', '2026-11-19', '15:52', 'High', 'reported'],
  ['INC-0225', 'PM2.5 above limit', 'CP2', 'UC-8-8', '2026-11-19', '15:40', 'Medium', 'resolved', null, 38],
  ['INC-0224', 'Water leak or stain', 'CP1', 'UW-8-5', '2026-11-18', '15:28', 'High', 'resolved'],
  ['INC-0221', 'Floor obstruction', 'CP2', 'UC-8-8', '2026-11-17', '15:57', 'Medium', 'resolved'],
  ['INC-0219', 'PM2.5 above limit', 'CP2', 'UC-8-8', '2026-11-16', '14:32', 'Medium', 'resolved', null, 37],
  ['INC-0217', 'Floor obstruction', 'CP4', 'UC-8-11', '2026-11-15', '10:18', 'Medium', 'resolved'],
];

export function incidentTimestamp(day, time) {
  return Date.parse(day + 'T' + (time || '00:00') + ':00+08:00');
}

const recordedActions = {
  'INC-0230': [{ timestamp: incidentTimestamp('2026-11-20', '10:35'), status: 'reported', assignment: 'Facilities Management' }],
  'INC-0229': [{ timestamp: incidentTimestamp('2026-11-19', '16:40'), status: 'acknowledged' }],
  'INC-0226': [{ timestamp: incidentTimestamp('2026-11-19', '16:10'), status: 'reported', assignment: 'Facilities Management' }],
};

export const sampleIncidents = rows.map(([id, title, checkpoint, room, day, time, severity, status, confidence, pm25]) => ({
  id, title, checkpoint, room, day, time, severity, status, confidence, pm25,
  sample: true,
  photo: id === 'INC-0231' ? SAMPLE_WATER_PHOTO : undefined,
  assignment: ['detected', 'acknowledged'].includes(status) ? 'Unassigned' : 'Facilities Management',
  history: recordedActions[id] || [],
})).sort((left, right) => (right.day + (right.time || '')).localeCompare(left.day + (left.time || '')));

export function applyIncidentUpdates(updates) {
  return sampleIncidents.map(incident => ({ ...incident, ...updates[incident.id] }));
}

export function responseDeadline(incident, responseHours, t, now = Date.now()) {
  if (!incident.time) return null;
  const detectedAt = incident.detectedAt ?? incidentTimestamp(incident.day, incident.time);
  const hours = responseHours?.[incident.severity] ?? RESPONSE_HOURS[incident.severity];
  const dueAt = detectedAt + hours * 3600000;
  const remaining = dueAt - (incident.sample ? SAMPLE_NOW : now);
  const minutes = Math.floor(Math.abs(remaining) / 60000);
  const duration = minutes >= 60
    ? t('{hours} h {minutes} min', { hours: Math.floor(minutes / 60), minutes: minutes % 60 })
    : t('{minutes} min', { minutes });
  return {
    hours, dueAt, overdue: remaining < 0 && incident.status !== 'resolved',
    label: incident.status === 'resolved' ? t('Resolved') : t(remaining < 0 ? '{duration} overdue' : '{duration} left', { duration }),
  };
}
