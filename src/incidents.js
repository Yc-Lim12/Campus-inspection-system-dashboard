export const INCIDENT_LABELS = {
  detected: 'Detected', acknowledged: 'Acknowledged', reported: 'Reported', on_hold: 'On hold', resolved: 'Resolved',
};

const rows = [
  ['INC-0231', 'Water leak or stain', 'CP1', 'UW-8-5', '2026-11-20', '10:12', 'High', 'detected', 0.86],
  ['INC-0230', 'PM2.5 above limit', 'CP2', 'UC-8-8', '2026-11-20', '10:31', 'Medium', 'reported', null, 41],
  ['INC-0228', 'Floor obstruction', 'CP4', 'UC-8-11', '2026-11-19', '16:05', 'Medium', 'resolved'],
  ['INC-0226', 'Wall crack', 'CP3', 'UC-8-10', '2026-11-19', '15:52', 'High', 'reported'],
  ['INC-0225', 'PM2.5 above limit', 'CP2', 'UC-8-8', '2026-11-19', '15:40', 'Medium', 'resolved', null, 38],
  ['INC-0224', 'Water leak or stain', 'CP1', 'UW-8-5', '2026-11-18', '15:28', 'High', 'resolved'],
  ['INC-0221', 'Floor obstruction', 'CP2', 'UC-8-8', '2026-11-17', '15:57', 'Medium', 'resolved'],
  ['INC-0219', 'PM2.5 above limit', 'CP2', 'UC-8-8', '2026-11-16', null, 'Medium', 'resolved'],
  ['INC-0217', 'Floor obstruction', 'CP4', 'UC-8-11', '2026-11-15', null, 'Medium', 'resolved'],
];

export const sampleIncidents = rows.map(([id, title, checkpoint, room, day, time, severity, status, confidence, pm25]) => ({
  id, title, checkpoint, room, day, time, severity, status, confidence, pm25,
  assignment: ['detected', 'acknowledged'].includes(status) ? 'Unassigned' : 'Facilities Management',
  history: [],
})).sort((left, right) => (right.day + (right.time || '')).localeCompare(left.day + (left.time || '')));

export function applyIncidentUpdates(updates) {
  return sampleIncidents.map(incident => ({ ...incident, ...updates[incident.id] }));
}
