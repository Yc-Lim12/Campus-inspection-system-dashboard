export const CHECKPOINT_ROOMS = {
  CP1: 'UW-8-5',
  CP2: 'UC-8-8',
  CP3: 'UC-8-10',
  CP4: 'UC-8-11',
};

// Demo readings, ordered from newest to oldest. Dates and times are local to campus.
const rows = [
  // ID, day, time, checkpoint, hazard, temperature, humidity, PM2.5, status, MQ135 change from baseline (%)
  [1042, '2026-11-20', '10:31', 'CP2', 'Air above limit', 24.6, 63, 41, 'INC-0230', 18],
  [1041, '2026-11-20', '10:12', 'CP1', 'Water leak or stain', 24.1, 71, 22, 'INC-0231', 12],
  [1043, '2026-11-19', '16:37', 'CP4', 'Minor floor obstruction', 24.4, 58, 16, 'INC-0229', 9],
  [1040, '2026-11-19', '16:18', 'CP4', 'No hazard', 24.9, 58, 14, 'Recheck after clearing'],
  [1039, '2026-11-19', '16:05', 'CP4', 'Floor obstruction', 25.0, 58, 14, 'INC-0228 · Resolved'],
  [1038, '2026-11-19', '15:52', 'CP3', 'Wall crack', 24.8, 59, 15, 'INC-0226', 7],
  [1037, '2026-11-19', '15:40', 'CP2', 'Air above limit', 24.9, 61, 38, 'INC-0225'],
  [1036, '2026-11-19', '15:28', 'CP1', 'No hazard', 24.5, 66, 19],
  [1035, '2026-11-19', '10:16', 'CP4', 'No hazard', 24.2, 57, 13],
  [1034, '2026-11-19', '10:04', 'CP3', 'No hazard', 23.8, 60, 12],
  [1033, '2026-11-19', '09:52', 'CP2', 'No hazard', 24.0, 62, 29],
  [1032, '2026-11-19', '09:40', 'CP1', 'No hazard', 24.2, 63, 18],
  [1031, '2026-11-18', '16:04', 'CP4', 'No hazard', 25.1, 59, 20],
  [1030, '2026-11-18', '15:52', 'CP3', 'No hazard', 24.8, 58, 17],
  [1029, '2026-11-18', '15:40', 'CP2', 'No hazard', 24.7, 62, 28],
  [1028, '2026-11-18', '15:28', 'CP1', 'Water leak or stain', 24.6, 68, 19, 'INC-0224 · Resolved'],
  [1027, '2026-11-18', '10:12', 'CP4', 'No hazard', 24.0, 60, 15],
  [1026, '2026-11-18', '10:00', 'CP3', 'No hazard', 24.1, 61, 13],
  [1025, '2026-11-18', '09:48', 'CP2', 'Air above limit', 24.2, 65, 36, 'PM2.5 above limit'],
  [1024, '2026-11-18', '09:36', 'CP1', 'No hazard', 24.1, 64, 19],
  [1023, '2026-11-17', '16:21', 'CP4', 'No hazard', 25.2, 60, 16],
  [1022, '2026-11-17', '16:09', 'CP3', 'No hazard', 24.9, 60, 15],
  [1021, '2026-11-17', '15:57', 'CP2', 'Floor obstruction', 24.8, 61, 21, 'INC-0221 · Resolved'],
  [1020, '2026-11-17', '15:45', 'CP1', 'No hazard', 24.6, 63, 17],
  [1019, '2026-11-17', '10:07', 'CP4', 'No hazard', 24.2, 60, 12],
];

export const sampleInspectionRecords = rows.map(([id, day, time, checkpoint, hazard, temperature, humidity, pm25, status = '—', gas = null]) => ({
  id: 'INS-' + id,
  day,
  time,
  checkpoint,
  location: checkpoint + ' · ' + CHECKPOINT_ROOMS[checkpoint],
  hazard,
  temperature,
  humidity,
  pm25,
  gas,
  status,
}));
