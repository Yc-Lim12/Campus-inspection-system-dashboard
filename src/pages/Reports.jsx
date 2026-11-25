import React from 'react';
import DashboardPage from '../DashboardPage.jsx';
import { DemoCtx } from '../ctx.js';
import { useDashboardLocale } from '../dashboardLocale.js';
import { exportSampleTables } from '../exportSampleTables.js';
import { INCIDENT_LABELS } from '../incidents.js';
import { sampleInspectionRecords } from '../inspectionRecords.js';

const tabs = [['summary', 'Summary'], ['incidents', 'Incidents'], ['air-quality', 'Air quality'], ['patrol-log', 'Patrol log']];
const emptyFilters = { checkpoint: '', from: '', to: '', hazard: '', severity: '', status: '', assignment: '' };
const incidentFilters = ['hazard', 'severity', 'status', 'assignment'];

const copy = {
  'Review inspection activity, incident status and air readings.': ['Semak aktiviti pemeriksaan, status insiden dan bacaan udara.', '查看检查活动、事件状态和空气读数。'],
  Summary: ['Ringkasan', '概览'], Incidents: ['Insiden', '事件'], 'Air quality': ['Kualiti udara', '空气质量'], 'Patrol log': ['Log rondaan', '巡逻日志'],
  'Export CSV': ['Eksport CSV', '导出 CSV'], 'Report sections': ['Bahagian laporan', '报告分类'], 'Report filters': ['Penapis laporan', '报告筛选'],
  'Search reports': ['Cari laporan', '搜索报告'], 'ID, room, hazard or status': ['ID, bilik, bahaya atau status', '编号、房间、隐患或状态'],
  'Record ID, room or reading': ['ID rekod, bilik atau bacaan', '记录编号、房间或读数'], 'Day, patrol window or checkpoint': ['Hari, waktu rondaan atau titik pemeriksaan', '日期、巡逻时段或检查点'],
  From: ['Dari', '开始日期'], To: ['Hingga', '结束日期'], 'All checkpoints': ['Semua titik pemeriksaan', '所有检查点'],
  'Hazard type': ['Jenis bahaya', '隐患类型'], 'All hazards': ['Semua bahaya', '所有隐患'], Severity: ['Keparahan', '严重程度'],
  'All severities': ['Semua tahap', '所有严重程度'], 'Any status': ['Semua status', '所有状态'],
  'Assigned to': ['Ditugaskan kepada', '指派给'], 'All assignments': ['Semua tugasan', '所有指派'],
  'Clear filters': ['Kosongkan penapis', '清除筛选'], 'The start date must be on or before the end date.': ['Tarikh mula mestilah pada atau sebelum tarikh akhir.', '开始日期须早于或等于结束日期。'],
  'No results match these filters.': ['Tiada hasil yang sepadan dengan penapis ini.', '没有符合这些筛选条件的结果。'],
  'Matching incidents': ['Insiden sepadan', '匹配的事件'], 'Matching readings': ['Bacaan sepadan', '匹配的读数'],
  'Matching patrol windows': ['Waktu rondaan sepadan', '匹配的巡逻时段'],
  'Incident trends': ['Trend insiden', '事件趋势'], 'Group by': ['Kumpulkan mengikut', '分组依据'],
  Weekly: ['Mingguan', '每周'], Daily: ['Harian', '每日'], 'Week starting': ['Minggu bermula', '周起始日期'],
  Incident: ['Insiden', '事件'], Hazard: ['Bahaya', '隐患'], Record: ['Rekod', '记录'], 'Date and time': ['Tarikh dan masa', '日期和时间'],
  Temperature: ['Suhu', '温度'], Humidity: ['Kelembapan', '湿度'], 'Limits exceeded': ['Had dilampaui', '超限项目'],
  'Within limits': ['Dalam had', '在限值内'], 'Patrol window': ['Waktu rondaan', '巡逻时段'],
  'Checkpoints inspected': ['Titik pemeriksaan diperiksa', '已检查的检查点'], Readings: ['Bacaan', '读数'],
  Morning: ['Pagi', '上午'], Afternoon: ['Petang', '下午'],
  Acknowledged: ['Diakui', '已确认'], Reported: ['Dilaporkan', '已报告'], 'On hold': ['Ditangguhkan', '暂缓'],
  Unassigned: ['Belum ditugaskan', '未指派'], 'Facilities Management': ['Pengurusan Fasiliti', '设施管理'],
  'Water leak or stain': ['Kebocoran atau kesan air', '漏水或水渍'], 'Wall crack': ['Retak dinding', '墙体裂缝'],
  'Floor obstruction': ['Halangan lantai', '地面障碍'], 'PM2.5 above limit': ['PM2.5 melebihi had', 'PM2.5 超限'],
};

function ReportTable({ label, columns, rows, empty }) {
  return (
    <div className="workflow-table report-table" tabIndex={0} role="region" aria-label={label}>
      <table>
        <caption className="sr">{label}</caption>
        <thead><tr>{columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead>
        <tbody>{rows.map(({ id, cells }) => <tr key={id}>{cells.map((cell, column) => <td key={columns[column]}>{cell}</td>)}</tr>)}</tbody>
      </table>
      {rows.length === 0 && <p className="report-empty" role="status">{empty}</p>}
    </div>
  );
}

function startOfWeek(day) {
  const date = new Date(day + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
}

function ReportSelect({ label, value, options, onChange }) {
  return <label>{label}<select className="report-select" value={value} onChange={event => onChange(event.target.value)}>
    {options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}
  </select></label>;
}

function ReportMetrics({ incidents, t }) {
  const resolved = incidents.filter(item => item.status === 'resolved').length;
  const values = [['Detected', incidents.length], ['Resolved', resolved], ['Unresolved', incidents.length - resolved]];
  return <dl className="report-metrics">{values.map(([label, value]) => (
    <div className="card" key={label} data-metric={label.toLowerCase()}><dt>{t(label)}</dt><dd>{value}</dd></div>
  ))}</dl>;
}

function ResolutionChart({ groups, t }) {
  const max = Math.max(1, ...groups.map(group => group.detected));
  return <div className="report-chart" aria-hidden="true">
    <div className="report-legend"><span>{t('Resolved')}</span><span>{t('Unresolved')}</span></div>
    {groups.map(({ day, detected, resolved }) => (
      <div className="report-chart-row" key={day}><span>{day}</span>
        <div className="report-chart-track">
          <span style={{ width: (resolved / max * 100) + '%' }} />
          <span style={{ width: ((detected - resolved) / max * 100) + '%' }} />
        </div>
        <strong>{detected}</strong>
      </div>
    ))}
  </div>;
}

export default function Reports({ section }) {
  const { incidents, configuration } = React.useContext(DemoCtx);
  const { language, t } = useDashboardLocale(copy);
  const [tab, tabLabel] = tabs.find(([id]) => id === section) || tabs[0];
  const [filters, setFilters] = React.useState(emptyFilters);
  const [queries, setQueries] = React.useState({});
  const [period, setPeriod] = React.useState('weekly');
  const { checkpoint, hazard, severity, status, assignment, from, to } = filters;
  const set = key => value => setFilters(current => ({ ...current, [key]: value }));
  const summary = tab === 'summary';
  const incidentTab = summary || tab === 'incidents';
  const queryScope = incidentTab ? 'incidents' : tab;
  const q = queries[queryScope] || '';
  const badRange = Boolean(from && to && from > to);
  const active = q.trim() || Object.keys(filters).some(key => filters[key] && (incidentTab || !incidentFilters.includes(key)));
  const terms = q.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const matchesText = (...fields) => {
    const text = fields.join(' ').toLocaleLowerCase();
    return terms.every(term => text.includes(term));
  };
  const withinFilters = item => !badRange && (!from || item.day >= from) && (!to || item.day <= to) &&
    (!checkpoint || item.checkpoint === checkpoint);

  const matchingIncidents = incidentTab ? incidents.filter(item => withinFilters(item) &&
    (!hazard || item.title === hazard) && (!severity || item.severity === severity) &&
    (!status || item.status === status) && (!assignment || item.assignment === assignment) &&
    matchesText(item.id, item.day, item.title, t(item.title), item.room, item.checkpoint, item.severity,
      t(item.severity), INCIDENT_LABELS[item.status], t(INCIDENT_LABELS[item.status]), item.assignment, t(item.assignment))) : [];
  const byPeriod = new Map();
  for (const item of matchingIncidents) {
    const day = period === 'weekly' ? startOfWeek(item.day) : item.day;
    const group = byPeriod.get(day) || { day, detected: 0, resolved: 0 };
    group.detected += 1;
    if (item.status === 'resolved') group.resolved += 1;
    byPeriod.set(day, group);
  }
  const groups = [...byPeriod.values()].sort((first, second) => second.day.localeCompare(first.day));

  const readings = incidentTab ? [] : sampleInspectionRecords.filter(withinFilters);
  const patrols = new Map();
  if (tab === 'patrol-log') {
    for (const reading of readings) {
      const shift = reading.time < '12:00' ? 'Morning' : 'Afternoon';
      const key = reading.day + ' · ' + shift;
      const group = patrols.get(key) || { day: reading.day, shift, checkpoints: new Set(), rooms: new Set(), total: 0 };
      group.checkpoints.add(reading.checkpoint);
      group.rooms.add(reading.location);
      group.total += 1;
      patrols.set(key, group);
    }
  }

  let columns;
  let rows;
  if (summary) {
    columns = [period === 'weekly' ? 'Week starting' : 'Date', 'Detected', 'Resolved', 'Unresolved'];
    rows = groups.map(({ day, detected, resolved }) => ({ id: day, cells: [day, detected, resolved, detected - resolved] }));
  } else if (tab === 'incidents') {
    columns = ['Incident', 'Date', 'Hazard', 'Checkpoint', 'Severity', 'Status', 'Assigned to'];
    rows = matchingIncidents.map(item => ({ id: item.id, cells: [
      <a href={'#alerts/' + item.id}>{item.id}</a>, item.day, t(item.title), item.checkpoint + ' · ' + item.room,
      <span className="report-severity" data-severity={item.severity}>{t(item.severity)}</span>,
      t(INCIDENT_LABELS[item.status]), t(item.assignment),
    ] }));
  } else if (tab === 'air-quality') {
    columns = ['Record', 'Date and time', 'Checkpoint', 'Temperature', 'Humidity', 'PM2.5', 'Limits exceeded'];
    const { temperatureMin, temperatureMax, humidityMin, humidityMax, pm25 } = configuration.limits;
    rows = readings.flatMap(item => {
      const exceeded = [
        (item.temperature < temperatureMin || item.temperature > temperatureMax) && t('Temperature'),
        (item.humidity < humidityMin || item.humidity > humidityMax) && t('Humidity'),
        item.pm25 > pm25 && 'PM2.5',
      ].filter(Boolean).join(', ');
      const values = [item.temperature.toFixed(1) + ' °C', item.humidity + '%', item.pm25 + ' µg/m³', exceeded || t('Within limits')];
      if (!matchesText(item.id, item.day, item.time, item.location, item.hazard, t(item.hazard), item.status, 'PM2.5', ...values)) return [];
      return [{ id: item.id, cells: [<a href={'#records/' + item.id}>{item.id}</a>, item.day + ' ' + item.time, item.location, ...values] }];
    });
  } else {
    columns = ['Patrol window', 'Checkpoints inspected', 'Readings'];
    rows = Array.from(patrols, ([key, group]) => ({ key, ...group }))
      .filter(group => matchesText(group.day, group.shift, t(group.shift), ...group.rooms))
      .map(group => ({ id: group.key, cells: [group.day + ' · ' + t(group.shift), [...group.checkpoints].sort().join(', '), group.total] }));
  }

  const options = (all, values) => [['', t(all)], ...[...new Set(values)].map(value => [value, t(value)]).sort((a, b) => a[1].localeCompare(b[1], language))];
  const matches = summary ? matchingIncidents.length : rows.length;
  const countLabel = incidentTab ? 'Matching incidents' : tab === 'air-quality' ? 'Matching readings' : 'Matching patrol windows';
  const placeholder = incidentTab ? 'ID, room, hazard or status' : tab === 'air-quality' ? 'Record ID, room or reading' : 'Day, patrol window or checkpoint';
  function clearFilters() {
    setQueries(current => ({ ...current, [queryScope]: '' }));
    setFilters(current => incidentTab ? emptyFilters : { ...current, from: '', to: '', checkpoint: '' });
  }

  return (
    <DashboardPage title={t('Reports')} lang={language} className="pg-reports"
      description={t('Review inspection activity, incident status and air readings.')}
      actions={<button className="btn primary" type="button" disabled={!rows.length}
        onClick={event => exportSampleTables(event, tab + '-report.csv')}>{t('Export CSV')}</button>}>
      <nav className="report-tabs" aria-label={t('Report sections')}>
        {tabs.map(([id, label]) => <a key={id} aria-current={id === tab ? 'page' : undefined} href={'#reports/' + id}>{t(label)}</a>)}
      </nav>
      <section className="card report-filters" aria-label={t('Report filters')}>
        <div className="report-filter-heading">
          <h2>{t('Report filters')}</h2>
          <button className="btn" type="button" disabled={!active} onClick={clearFilters}>{t('Clear filters')}</button>
        </div>
        <div className="workflow-form report-fields">
          <label className="report-search">{t('Search reports')}<input type="search" value={q}
            onChange={event => setQueries(current => ({ ...current, [queryScope]: event.target.value }))}
            placeholder={t(placeholder)} autoComplete="off" /></label>
          <ReportSelect label={t('Checkpoint')} value={checkpoint} options={[['', t('All checkpoints')], ...configuration.checkpoints.map(item =>
            [item.id, item.id + ' · ' + item.room])]} onChange={set('checkpoint')} />
          <label>{t('From')}<input type="date" value={from} onChange={event => set('from')(event.target.value)} aria-invalid={badRange || undefined} /></label>
          <label>{t('To')}<input type="date" value={to} onChange={event => set('to')(event.target.value)} aria-invalid={badRange || undefined} /></label>
        </div>
        {incidentTab && <div className="workflow-form report-incident-fields">
          <ReportSelect label={t('Hazard type')} value={hazard} options={options('All hazards', incidents.map(item => item.title))} onChange={set('hazard')} />
          <ReportSelect label={t('Severity')} value={severity} options={options('All severities', ['High', 'Medium', 'Low'])} onChange={set('severity')} />
          <ReportSelect label={t('Status')} value={status} options={[[ '', t('Any status') ], ...Object.entries(INCIDENT_LABELS).map(([id, label]) => [id, t(label)])]} onChange={set('status')} />
          <ReportSelect label={t('Assigned to')} value={assignment} options={options('All assignments', incidents.map(item => item.assignment))} onChange={set('assignment')} />
        </div>}
        {badRange && <p className="report-error" role="alert">{t('The start date must be on or before the end date.')}</p>}
      </section>
      {summary && <ReportMetrics incidents={matchingIncidents} t={t} />}
      <section className="card report-results" aria-labelledby="report-result-heading">
        <div className="report-result-heading">
          <div>
            <h2 id="report-result-heading">{t(summary ? 'Incident trends' : tabLabel)}</h2>
            <p role="status" className="muted">{t(countLabel)} <strong>{matches}</strong></p>
          </div>
          {summary && <div className="workflow-form"><ReportSelect label={t('Group by')} value={period}
            options={[['weekly', t('Weekly')], ['daily', t('Daily')]]} onChange={setPeriod} /></div>}
        </div>
        {summary && groups.length > 0 && <ResolutionChart groups={groups} t={t} />}
        <ReportTable label={t(tabLabel)} columns={columns.map(t)} rows={rows} empty={t('No results match these filters.')} />
      </section>
    </DashboardPage>
  );
}
