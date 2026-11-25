import React from 'react';
import { useDashboardLocale } from '../dashboardLocale.js';
import RoverSchematic from "../RoverSchematic.jsx";
import Sidebar from '../Sidebar.jsx';
import { DemoCtx } from '../ctx.js';
import RobotControls, { RobotSummary } from '../RobotControls.jsx';
import { campusTime, limitsForCheckpoint } from '../dashboardState.js';
import { INCIDENT_LABELS, RESPONSE_HOURS, SAMPLE_NOW, incidentTimestamp, responseDeadline } from '../incidents.js';
import { sampleInspectionRecords } from '../inspectionRecords.js';

const MAP_LAYERS = [
  { key: 'route', label: 'Route' },
  { key: 'incidents', label: 'Incidents' },
  { key: 'air', label: 'Air quality' },
];

const CHECKPOINT_AIR = [
  ['CP1', 150, 160], ['CP2', 407, 275], ['CP3', 642, 275], ['CP4', 778, 420],
].map(([id, x, y]) => ({
  ...sampleInspectionRecords.find(record => record.checkpoint === id), id, x, y,
}));

const severityColors = { High: 'var(--danger)', Medium: 'var(--warning)', Low: 'var(--accent)' };

function OpenIncidents({ incidents, responseHours, language, t }) {
  const open = incidents.filter(item => item.status !== 'resolved');
  const counts = Object.keys(RESPONSE_HOURS).map(severity => [severity, open.filter(item => item.severity === severity).length]);
  return (
    <section className="pc overview-incidents" aria-labelledby="in-h">
      <header className="overview-incident-heading">
        <h2 id="in-h" className="oh">{t('Open incidents')} <span className="cnt">{open.length}</span></h2>
        <div className="isum">
          {counts.map(([severity, count]) => <span key={severity}><i style={{ background: severityColors[severity] }} />
            {t(severity)} {count}</span>)}
          <a href="#alerts">{t('All incidents')}</a>
        </div>
      </header>
      {!!open.length && <div className="sevbar" aria-hidden="true">
        {counts.filter(([, count]) => count > 0).map(([severity, count]) =>
          <i key={severity} style={{ flex: count, background: severityColors[severity] }} />)}
      </div>}
      <ul className="ilist">
        {open.map(item => {
          const deadline = responseDeadline(item, responseHours, t);
          return (
            <li key={item.id} data-severity={item.severity}>
              <a href={'#alerts/' + item.id}>
                {item.photo ? <img className="incident-thumb" src={item.photo} alt="" />
                  : <span className="incident-thumb report-severity" data-severity={item.severity} aria-hidden="true">
                      {item.pm25 ?? '!'}</span>}
                <span className="iti"><b>{t(item.title)}</b><span>{item.id} · {item.checkpoint} · {item.room}</span>
                  {item.time && <span>{campusTime(incidentTimestamp(item.day, item.time), language)}</span>}
                </span>
                <span className="overview-incident-status"><span className="report-severity" data-severity={item.severity}>{t(item.severity)}</span>
                  <span>{t(INCIDENT_LABELS[item.status])}</span></span>
                {deadline && <strong className={deadline.overdue ? 'sla-overdue' : undefined}>{deadline.label}</strong>}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CheckpointAir({ configuration, t }) {
  return (
    <section className="pc overview-air">
      <h2 className="oh">{t('Air at checkpoints')}</h2>
      <div className="overview-air-scroll">
        <table className="ot">
          <caption className="sr">{t('Latest air readings')}</caption>
          <thead><tr><th scope="col">{t('Checkpoint')}</th><th scope="col">°C</th><th scope="col">RH</th>
            <th scope="col">PM2.5</th><th scope="col">{t('Gas (MQ135)')}</th></tr></thead>
          <tbody>{CHECKPOINT_AIR.map(record => {
            const { id, temperature, humidity, pm25, gas, day } = record;
            const limits = limitsForCheckpoint(configuration, id);
            const readingClass = exceeded => exceeded ? 'air-reading-over-limit' : day < '2026-11-20' ? 'muted' : undefined;
            return <tr key={id}>
              <th scope="row">{id}</th>
              <td className={readingClass(temperature < limits.temperatureMin || temperature > limits.temperatureMax)}>{temperature.toFixed(1)}</td>
              <td className={readingClass(humidity < limits.humidityMin || humidity > limits.humidityMax)}>{humidity}%</td>
              <td className={readingClass(pm25 > limits.pm25)}>{pm25}</td>
              <td className={readingClass(gas != null && gas > limits.gas)}>{gas == null ? '—' : '+' + gas + '%'}</td>
            </tr>;
          })}</tbody>
        </table>
      </div>
      <p className="muted">{t('Gas readings show the percentage above the sample baseline.')}</p>
      <p className="muted">{t("Grey values are from yesterday's patrol.")}</p>
    </section>
  );
}

function IncidentMetric({ incidents, language, t }) {
  const days = Array.from({ length: 7 }, (_, index) => new Date(SAMPLE_NOW - (6 - index) * 86400000).toISOString().slice(0, 10));
  const week = incidents.filter(incident => incident.sample && days.includes(incident.day));
  const resolved = week.filter(incident => incident.status === 'resolved').length;
  const counts = days.map(day => week.filter(incident => incident.day === day).length);
  const maximum = Math.max(1, ...counts);
  const weekday = new Intl.DateTimeFormat(language, { weekday: 'short', timeZone: 'UTC' });
  return (
    <div className="kp">
      <div className="kh2"><span className="ki">{'✓'}</span><span>{t('Incidents')}</span>
        <span className="dlt up">{t('{percent}% fixed', { percent: week.length ? Math.round(resolved / week.length * 100) : 0 })}</span></div>
      <div className="kv"><b>{week.length}</b><small>{t('found')}</small><b style={{ marginLeft: 10 }}>{resolved}</b>
        <small>{t('fixed')}</small><em>{t('this week')}</em></div>
      <svg className="spk" viewBox="0 0 300 64" role="img" aria-label={t('Incidents detected over the last seven demo days')}>
        {counts.map((count, index) => {
          const x = 6 + index * 43.5;
          const height = Math.max(2, 30 * count / maximum);
          return <g key={days[index]}>
            <rect x={x} y={46 - height} width="26" height={height} rx="5" fill={index === 6 ? 'var(--accent)' : 'var(--line-strong)'} />
            <text x={x + 13} y={42 - height} textAnchor="middle" fontSize="10" fill="var(--muted-ink)">{count}</text>
            <text x={x + 13} y="61" textAnchor="middle" fontSize="9" fill="var(--ink)">{index === 6 ? t('Today') : weekday.format(new Date(days[index]))}</text>
          </g>;
        })}
      </svg>
    </div>
  );
}

const PATROL_METRICS = [
  { label: 'Battery', value: '78%', progress: 78, note: 'about 1 h 50 min', color: 'var(--mint)' },
  { label: 'Checkpoints', value: '2/4', progress: 50, note: 'this patrol', color: 'var(--gauge-amber)' },
  { label: 'Coverage', value: '98%', progress: 97.8, note: 'this week', color: 'var(--heat)' },
];

function PatrolGauges() {
  const { t } = useDashboardLocale();
  return (
    <dl className="patrol-gauges" aria-label={t("Patrol summary")}>
      {PATROL_METRICS.map(({ label, value, progress, note, color }) => (
        <div key={label} className="patrol-gauge" style={{ '--gauge-color': color }}>
          <dt className="gauge-label">{t(label)}</dt>
          <dd className="gauge-dial">
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <circle className="gauge-track" cx="20" cy="20" r="16" />
              <circle
                className="gauge-arc arc"
                cx="20" cy="20" r="16"
                pathLength="100"
                strokeDasharray={progress + ' 100'}
                transform="rotate(-90 20 20)"
              />
            </svg>
            <strong className="gauge-value">{value}</strong>
          </dd>
          <dd className="gauge-note">{t(note)}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Overview({ section }) {
  const { language, t } = useDashboardLocale();
  const { robot, configuration, incidents, photoRequests } = React.useContext(DemoCtx);
  const floors = ['Univ L8', 'Univ L4', 'College L1'];
  const [floor, setFloor] = React.useState(floors[0]);
  const point = configuration.checkpoints.find(item => item.id === section);
  const mapAlerts = ['INC-0231', 'INC-0230'].map(id => incidents.find(item => item.id === id));
  const lowMapAlert = incidents.find(item => item.id === 'INC-0229' && item.status !== 'resolved');
  const cp2Limit = limitsForCheckpoint(configuration, 'CP2').pm25;
  const simulatorPoint = CHECKPOINT_AIR.find(item => item.id === robot.position);
  const marker = !robot.updated ? [540, 275] : simulatorPoint ? [simulatorPoint.x, simulatorPoint.y] : [150, 395];
  const latestRequest = photoRequests.find(item => Date.now() - item.timestamp < configuration.retentionHours * 3600000);
  React.useEffect(() => {
    if (!section) return;
    setFloor('Univ L8');
    setView('map');
  }, [section]);
  const [view, setView] = React.useState('map');
  const [layers, setLayers] = React.useState({ route: true, incidents: true, air: false });
  return (<div className="pg pg-overview">
<div style={{"minHeight": "100vh", "margin": "0 auto", "display": "flex", "flexWrap": "wrap"}}>{" "}<a href="#main" className="skip">{t("Skip to main content")}</a>{" "}<Sidebar />{" "}<div className="content">{" "}<main id="main" tabIndex={-1} style={{"padding": "18px 24px 28px", "display": "flex", "flexDirection": "column", "gap": "14px"}}>{" "}<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "10px 16px"}}>{" "}<h1 style={{"margin": "0", "fontSize": "24px", "fontWeight": "700", "letterSpacing": "-.02em"}}>{t("Overview")}</h1>{" "}<div className="fl" role="group" aria-label={t("Floor")}>{" "}{floors.map(name => <button type="button" key={name} className={floor === name ? 'on' : ''}
  aria-pressed={floor === name} onClick={() => setFloor(name)}>{t(name)}</button>)}{" "}</div>{" "}<span className="muted" style={{"marginLeft": "auto", "fontSize": "13px", "fontVariantNumeric": "tabular-nums"}}>{t("Sample readings · 20 Nov 2026")}</span>{" "}</div>{" "}<section className="hero" aria-labelledby="hero-h">{" "}<RoverSchematic />{" "}<div className="hmain">{" "}<div style={{"display": "flex", "alignItems": "center", "gap": "10px", "flexWrap": "wrap"}}><h2 id="hero-h" style={{"margin": "0", "fontSize": "15px", "fontWeight": "600", "color": "var(--cB9C6D8)"}}>{t("Robot 01")}</h2><span className="live"><i className="breathe"></i><RobotSummary /></span></div>{" "}<p className="big"><RobotSummary detailed /></p>{" "}<p style={{"margin": "2px 0 14px", "color": "var(--cB9C6D8)", "fontSize": "14px"}}>{robot.updated ? t('Simulator updated {time}', { time: campusTime(robot.updated, language) }) : t('Robot simulator · initial patrol')}</p>{" "}<div className="cps" role="list" aria-label={t("Checkpoints: CP1 hazard found, CP2 air alert, CP3 next, CP4 waiting")}>{" "}<div role="listitem"><i style={{"background": "var(--cE07B72)"}}></i><span>{"CP1"}</span><em>{t("Leak")}</em></div>{" "}<div role="listitem"><i style={{"background": "var(--cDDA03E)"}}></i><span>{"CP2"}</span><em>{"PM2.5"}</em></div>{" "}<div role="listitem" className="nx"><i style={{"background": "linear-gradient(90deg,var(--c7AA7E8) 45%,rgba(255,255,255,.15) 45%)"}}></i><span>{"CP3"}</span><em>{t("Next")}</em></div>{" "}<div role="listitem"><i></i><span>{"CP4"}</span><em>{t("Waiting")}</em></div>{" "}</div>{" "}<div style={{"display": "flex", "gap": "8px", "flexWrap": "wrap", "marginTop": "16px"}}>{" "}<RobotControls className="hb" stopClassName="hb stop" />{" "}</div>{" "}</div>{" "}<PatrolGauges />{" "}</section>{" "}<div className="kpis">{" "}<div className="kp"><div className="kh2"><span className="ki" style={{"background": "var(--cFFF0E0)", "color": "var(--cC25E00)"}}>{"°C"}</span><span>{t("Temperature")}</span><span className="dlt up">{"▲ 0.3°"}</span></div>{" "}<div className="kv"><b>{"24.4"}</b><small>{"°C"}</small><em>{t("comfortable · 23–26 °C")}</em></div>{" "}<svg className="spk" viewBox="0 0 300 64" role="img" aria-label={t("Average temperature over the last 7 days, between 23.9 and 24.4 degrees, inside the comfortable band")}><defs><linearGradient id="gT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E08A2E" stopOpacity=".22"></stop><stop offset="1" stopColor="#E08A2E" stopOpacity="0"></stop></linearGradient></defs><path d="M6.0 25.5 C14.0 25.1 38.0 22.4 54.0 22.6 C70.0 22.9 86.0 27.2 102.0 27.0 C118.0 26.8 134.0 21.6 150.0 21.2 C166.0 20.7 182.0 23.6 198.0 24.1 C214.0 24.6 230.0 24.8 246.0 24.1 C262.0 23.3 286.0 20.4 294.0 19.7 L294.0 46 L6.0 46 Z" fill="url(#gT)"></path><path className="ln" d="M6.0 25.5 C14.0 25.1 38.0 22.4 54.0 22.6 C70.0 22.9 86.0 27.2 102.0 27.0 C118.0 26.8 134.0 21.6 150.0 21.2 C166.0 20.7 182.0 23.6 198.0 24.1 C214.0 24.6 230.0 24.8 246.0 24.1 C262.0 23.3 286.0 20.4 294.0 19.7" fill="none" stroke="#E08A2E" strokeWidth="2.4" strokeLinecap="round"></path><circle cx="294.0" cy="19.7" r="7" fill="#E08A2E" opacity=".18"></circle><circle cx="294.0" cy="19.7" r="3.8" fill="#FFFFFF" stroke="#E08A2E" strokeWidth="2.4"></circle><text x="6.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "S" : t('Sat')}</text><text x="54.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "S" : t('Sun')}</text><text x="102.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "M" : t('Mon')}</text><text x="150.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "T" : t('Tue')}</text><text x="198.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "W" : t('Wed')}</text><text x="246.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "T" : t('Thu')}</text><text x="294.0" y="61" textAnchor="middle" fontSize="10" fill="#1D1D1F" fontWeight="600">{t("Today")}</text></svg></div>{" "}<div className="kp"><div className="kh2"><span className="ki" style={{"background": "var(--cE6EEFA)", "color": "var(--c1E5AA8)"}}>{"RH"}</span><span>{t("Humidity")}</span><span className="dlt dn">{"▼ 2%"}</span></div>{" "}<div className="kv"><b>{"63"}</b><small>{"%"}</small><em>{t("normal · 40–70%")}</em></div>{" "}<svg className="spk" viewBox="0 0 300 64" role="img" aria-label={t("Average humidity over the last 7 days, between 63 and 67 percent")}><defs><linearGradient id="gH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A7FD4" stopOpacity=".22"></stop><stop offset="1" stopColor="#4A7FD4" stopOpacity="0"></stop></linearGradient></defs><path d="M6.0 21.4 C14.0 22.2 38.0 26.3 54.0 25.9 C70.0 25.5 86.0 19.5 102.0 19.2 C118.0 18.8 134.0 22.2 150.0 23.6 C166.0 25.1 182.0 28.1 198.0 28.1 C214.0 28.1 230.0 23.6 246.0 23.6 C262.0 23.6 286.0 27.4 294.0 28.1 L294.0 46 L6.0 46 Z" fill="url(#gH)"></path><path className="ln" d="M6.0 21.4 C14.0 22.2 38.0 26.3 54.0 25.9 C70.0 25.5 86.0 19.5 102.0 19.2 C118.0 18.8 134.0 22.2 150.0 23.6 C166.0 25.1 182.0 28.1 198.0 28.1 C214.0 28.1 230.0 23.6 246.0 23.6 C262.0 23.6 286.0 27.4 294.0 28.1" fill="none" stroke="#4A7FD4" strokeWidth="2.4" strokeLinecap="round"></path><circle cx="294.0" cy="28.1" r="7" fill="#4A7FD4" opacity=".18"></circle><circle cx="294.0" cy="28.1" r="3.8" fill="#FFFFFF" stroke="#4A7FD4" strokeWidth="2.4"></circle><text x="6.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "S" : t('Sat')}</text><text x="54.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "S" : t('Sun')}</text><text x="102.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "M" : t('Mon')}</text><text x="150.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "T" : t('Tue')}</text><text x="198.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "W" : t('Wed')}</text><text x="246.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "T" : t('Thu')}</text><text x="294.0" y="61" textAnchor="middle" fontSize="10" fill="#1D1D1F" fontWeight="600">{t("Today")}</text></svg></div>{" "}<div className={41 > cp2Limit ? "kp warnk" : "kp"}><div className="kh2"><span className="ki" style={{"background": "var(--cF28C28)", "color": "var(--cFFFFFF)"}}>{"PM"}</span><span>{t("PM2.5 at CP2")}</span><span className="dlt bad">{"▲ 3"}</span></div>{" "}<div className="kv"><b style={{"color": "var(--cB25200)"}}>{"41"}</b><small>{"µg/m³"}</small><em style={{"color": "var(--cB25200)"}}>{t(41 > cp2Limit ? "above limit" : "Within limits")} · {t("Limit {value}", { value: cp2Limit })}</em></div>{" "}<svg className="spk" viewBox="0 0 300 64" role="img" aria-label={t("PM2.5 at CP2 over the last 7 days, rising from 18 to 41")}><defs><linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E08A2E" stopOpacity=".22"></stop><stop offset="1" stopColor="#E08A2E" stopOpacity="0"></stop></linearGradient></defs><path d="M6.0 37.6 C14.0 37.2 38.0 35.6 54.0 35.4 C70.0 35.3 86.0 37.2 102.0 36.5 C118.0 35.8 134.0 33.0 150.0 31.2 C166.0 29.5 182.0 28.4 198.0 25.9 C214.0 23.5 230.0 18.6 246.0 16.4 C262.0 14.3 286.0 13.8 294.0 13.3 L294.0 46 L6.0 46 Z" fill="url(#gP)"></path><path className="ln" d="M6.0 37.6 C14.0 37.2 38.0 35.6 54.0 35.4 C70.0 35.3 86.0 37.2 102.0 36.5 C118.0 35.8 134.0 33.0 150.0 31.2 C166.0 29.5 182.0 28.4 198.0 25.9 C214.0 23.5 230.0 18.6 246.0 16.4 C262.0 14.3 286.0 13.8 294.0 13.3" fill="none" stroke="#E08A2E" strokeWidth="2.4" strokeLinecap="round"></path><circle cx="294.0" cy="13.3" r="7" fill="#E08A2E" opacity=".18"></circle><circle cx="294.0" cy="13.3" r="3.8" fill="#FFFFFF" stroke="#E08A2E" strokeWidth="2.4"></circle><text x="6.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "S" : t('Sat')}</text><text x="54.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "S" : t('Sun')}</text><text x="102.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "M" : t('Mon')}</text><text x="150.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "T" : t('Tue')}</text><text x="198.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "W" : t('Wed')}</text><text x="246.0" y="61" textAnchor="middle" fontSize="10" fill="#A1A1A6">{language === 'en' ? "T" : t('Thu')}</text><text x="294.0" y="61" textAnchor="middle" fontSize="10" fill="#1D1D1F" fontWeight="600">{t("Today")}</text></svg></div>{" "}<IncidentMetric incidents={incidents} language={language} t={t} />{" "}</div>{" "}<div style={{"display": "flex", "flexWrap": "wrap", "gap": "14px", "alignItems": "stretch"}}>{" "}<section aria-label={t("Floor map")} className="mapw">{" "}<div className="mapbar">{" "}<div role="group" aria-label={t("View")} style={{"display": "flex", "gap": "2px"}}>{" "}<button type="button" id="bMap" className={view === 'map' ? 'tg on' : 'tg'} aria-pressed={view === 'map'} onClick={() => setView('map')}>{t("Floor map")}</button>{" "}<button type="button" id="bCam" className={view === 'cam' ? 'tg on' : 'tg'} aria-pressed={view === 'cam'} onClick={() => setView('cam')}>{t("Camera")}</button>{" "}</div>{" "}<div className="lay" role="group" aria-label={t("Map layers")} hidden={view !== "map" || floor !== floors[0]}>
  <span>{t("Show")}</span>
  {MAP_LAYERS.map(({ key, label }) => (
    <label key={key}>
      <input
        type="checkbox"
        checked={layers[key]}
        aria-controls={`map-${key}`}
        onChange={(event) => {
          const { checked } = event.currentTarget;
          setLayers((current) => ({ ...current, [key]: checked }));
        }}
      />
      {t(label)}
    </label>
  ))}
</div>{" "}</div>{" "}<div className="mapc">{" "}{view === 'map' && floor !== floors[0] && <p className="map-unavailable" role="status">{t('No floor plan has been configured for {floor}.', { floor: t(floor) })}</p>}
<div id="vMap" className="map-view" hidden={view !== 'map' || floor !== floors[0]}>{" "}<svg role="img" data-incidents={layers.incidents} aria-label={t("Sunway University Level 8 floor plan with four inspection checkpoints, the dock, and the staffroom no-camera zone.")} viewBox="0 0 900 520" style={{"position": "absolute", "inset": "0", "width": "100%", "height": "100%"}}><defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#8C6A45" strokeWidth="2" strokeOpacity=".35"></line></pattern></defs><rect width="900" height="520" fill="#F7F5F2"></rect><g fill="#E6DED4" stroke="#8E8478" strokeWidth="1.2"><path d="M40 30 H205 V250 H720 V40 H860 V490 H720 V300 H205 V490 H40 Z"></path></g><g fill="#D3AC7C" stroke="#8E8478" strokeWidth="1"><rect x="40" y="30" width="85" height="80"></rect><rect x="40" y="120" width="85" height="70"></rect><rect x="40" y="190" width="85" height="60"></rect><rect x="40" y="250" width="85" height="60"></rect><rect x="40" y="410" width="80" height="80"></rect><rect x="120" y="410" width="85" height="80"></rect><rect x="250" y="170" width="105" height="80"></rect><rect x="355" y="170" width="105" height="80"></rect><rect x="460" y="170" width="105" height="80"></rect><rect x="565" y="170" width="155" height="80"></rect><rect x="250" y="300" width="105" height="80"></rect><rect x="355" y="300" width="105" height="80"></rect><rect x="460" y="300" width="105" height="80"></rect><rect x="565" y="300" width="155" height="80"></rect></g><g fill="#BC8749" stroke="#8E8478" strokeWidth="1"><rect x="720" y="40" width="28" height="200"></rect><rect x="808" y="40" width="52" height="34"></rect><rect x="808" y="74" width="52" height="34"></rect><rect x="808" y="108" width="52" height="34"></rect><rect x="808" y="142" width="52" height="34"></rect><rect x="808" y="176" width="52" height="34"></rect><rect x="808" y="210" width="52" height="34"></rect><rect x="720" y="400" width="40" height="90"></rect><rect x="808" y="400" width="52" height="90"></rect></g><rect x="720" y="40" width="140" height="210" fill="url(#hatch)"></rect><g fill="#2F5DA8"><rect x="40" y="320" width="55" height="45"></rect><rect x="808" y="300" width="52" height="45"></rect></g><g fill="#CFF3E8" stroke="#8E8478" strokeWidth=".8"><rect x="150" y="320" width="22" height="70"></rect><rect x="215" y="235" width="25" height="15"></rect><rect x="770" y="310" width="22" height="60"></rect></g><g fontSize="11" fill="#3B3128" textAnchor="middle" fontVariantNumeric="tabular-nums"><text x="82" y="74">{"UW-8-6"}</text><text x="82" y="158">{"UW-8-5"}</text><text x="82" y="224">{"UW-8-4"}</text><text x="82" y="284">{"UW-8-3"}</text><text x="80" y="454">{"UW-8-1"}</text><text x="162" y="454">{"UW-8-2"}</text><text x="302" y="214">{"UC-8-7"}</text><text x="407" y="214">{"UC-8-8"}</text><text x="512" y="214">{"UC-8-9"}</text><text x="642" y="214">{"UC-8-10"}</text><text x="302" y="344">{"UC-8-14"}</text><text x="407" y="344">{"UC-8-13"}</text><text x="512" y="344">{"UC-8-12"}</text><text x="642" y="344">{"UC-8-11"}</text></g><text x="790" y="262" fontSize="10" fill="#6B5A47" textAnchor="middle">{t("Staffroom · no camera")}</text><g id="map-route" className="map-overlay" hidden={!layers.route}>
  <path d="M150 395 V160 M150 275 H600" fill="none" stroke="#4A7FD4" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M600 275 H700" fill="none" stroke="#4A7FD4" strokeWidth="3" strokeDasharray="1 7" strokeLinecap="round"></path><path d="M700 275 H778 V420" fill="none" stroke="#9AA6B5" strokeWidth="3" strokeDasharray="1 7" strokeLinecap="round"></path>
</g>
<g><rect x="134" y="392" width="32" height="18" rx="4" fill="#FFFFFF" stroke="#B8AE9F"></rect><text x="150" y="405" fontSize="10" fill="#6B5A47" textAnchor="middle">{t("Dock")}</text></g><g fontSize="11" fontWeight="700" textAnchor="middle"><circle className="pin incident-pin" cx="150" cy="160" r="13" fill="#D0574F"></circle><circle className="incident-focus-ring" data-checkpoint="cp1" cx="150" cy="160" r="19" /><text x="150" y="164" fill="#FFFFFF">{"1"}</text><circle className="pin incident-pin" cx="407" cy="275" r="13" fill="#DDA03E"></circle><circle className="incident-focus-ring" data-checkpoint="cp2" cx="407" cy="275" r="19" /><text x="407" y="279" fill="#FFFFFF">{"2"}</text><circle className="pin" cx="642" cy="275" r="13" fill="#FFFFFF" stroke="#4A7FD4" strokeWidth="3"></circle><circle cx="642" cy="275" r="0" fill="none" stroke="#4A7FD4" strokeWidth="3"></circle><text x="642" y="279" fill="#4A7FD4">{"3"}</text><circle className="pin" cx="778" cy="420" r="13" fill="#FFFFFF" stroke="#9AA6B5" strokeWidth="3"></circle><circle cx="778" cy="420" r="0" fill="none" stroke="#9AA6B5" strokeWidth="3"></circle><text x="778" y="424" fill="#6E6E73">{"4"}</text></g><g transform={`translate(${marker.join(" ")})`}><circle r="16" fill="#4A7FD4" fillOpacity=".15"></circle><circle r="10" fill="#4A7FD4" stroke="#FFFFFF" strokeWidth="3"></circle><path d="M-3 -4 L5 0 L-3 4 Z" fill="#FFFFFF"></path></g>
{lowMapAlert && layers.incidents && <a href="#alerts/INC-0229" aria-label={t(lowMapAlert.title)}>
  <circle cx="792" cy="405" r="8" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />
</a>}
<g className="map-status-labels" textAnchor="middle" aria-hidden="true">
  <text x="150" y="190">{t(mapAlerts[0].status === 'resolved' ? 'Resolved' : 'Hazard')}</text>
  <text x="407" y="308">{t(mapAlerts[1].status === 'resolved' ? 'Resolved' : 'Air alert')}</text>
  <text x="642" y="308">{t(robot.destination === 'CP3' ? 'Next' : 'Checkpoint')}</text>
  <text x="778" y="452">{t(robot.destination === 'CP4' ? 'Next' : 'Checkpoint')}</text>
</g>
<g id="map-air" className="map-overlay map-air" hidden={!layers.air} aria-hidden="true">
  {CHECKPOINT_AIR.map(({ id, x, y, pm25 }) => (
    <g key={id} className={pm25 > limitsForCheckpoint(configuration, id).pm25 ? "over-limit" : undefined} transform={"translate(" + (x + 10) + " " + (y - 40) + ")"}>
      <rect width="78" height="23" rx="4" />
      <text x="39" y="16" textAnchor="middle">{pm25} µg/m³</text>
    </g>
  ))}
</g>
</svg>
<div id="map-incidents" className="map-overlay map-incidents" hidden={!layers.incidents}>
<a href="#alerts/INC-0231" className="call" data-checkpoint="cp1" style={{"left": "20%", "top": "18%"}}>{" "}<img className="incident-thumb" src={mapAlerts[0].photo} alt="" />{" "}<span><b>{t("Water leak")}</b><br />{"CP1 · UW-8-5 · 10:12"}<br /><em className="hi">{t('High') + ' · ' + t(INCIDENT_LABELS[mapAlerts[0].status])}</em></span></a>{" "}<a href="#alerts/INC-0230" className="call" data-checkpoint="cp2" style={{"left": "39%", "top": "77%"}}>{" "}<span className="pm">{"41"}</span>{" "}<span><b>{t("PM2.5 above limit")}</b><br />{"CP2 · UC-8-8 · 10:31"}<br /><em className="md">{t('Medium') + ' · ' + t(INCIDENT_LABELS[mapAlerts[1].status])}</em></span></a>
</div>
<div className="leg">
{layers.air && <span className="map-air-key">PM₂.₅</span>}{Object.entries(severityColors).map(([severity, color]) => <span key={severity}><i style={{ background: color }} />{t(severity)}</span>)}<span><i style={{"background": "var(--cFFFFFF)", "border": "2px solid var(--c4A7FD4)"}}></i>{t("Next")}</span><span><i style={{"background": "var(--cFFFFFF)", "border": "2px solid var(--c9AA6B5)"}}></i>{t("Waiting")}</span><span><i style={{"background": "var(--c2F5DA8)"}}></i>{t("Lift")}</span></div>{" "}</div>{" "}<div id="vCam" className="map-view" hidden={view !== 'cam'}>{" "}<div role="img" aria-label={t("Last photo from the robot's front camera, looking east along the Level 8 central corridor towards UC-8-10")} style={{"position": "absolute", "inset": "0", "background": "var(--c2B2E33)"}}>{" "}<svg viewBox="0 0 900 520" preserveAspectRatio="xMidYMid slice" style={{"position": "absolute", "inset": "0", "width": "100%", "height": "100%"}} aria-hidden="true"><path d="M0 520 L390 290 H510 L900 520 Z" fill="#6B6F76"></path><path d="M0 0 L390 230 H510 L900 0 Z" fill="#8A8E95"></path><path d="M0 0 L390 230 V290 L0 520 Z" fill="#7A7E85"></path><path d="M900 0 L510 230 V290 L900 520 Z" fill="#74787F"></path><rect x="390" y="230" width="120" height="60" fill="#565A61"></rect><g fill="#9C8466"><path d="M120 120 L120 430 L200 380 L200 170 Z"></path><path d="M780 120 L780 430 L700 380 L700 170 Z"></path></g><text x="160" y="110" fontSize="13" fill="#E3E5E8" textAnchor="middle">{"UC-8-9"}</text><text x="740" y="110" fontSize="13" fill="#E3E5E8" textAnchor="middle">{"UC-8-12"}</text></svg>{" "}<span className="tag" style={{"left": "12px", "top": "12px"}}>{latestRequest ? t('Latest simulated request · {time}', { time: campusTime(latestRequest.timestamp, language) }) : t('Sample camera view')}</span>{" "}<a href="#camera" className="tag" style={{"left": "12px", "bottom": "12px", "top": "auto", "color": "var(--c9CC9FF)"}}>{t("Open camera controls")}</a>{" "}</div>{" "}</div>{" "}</div>{" "}{point && <p className="workflow-checkpoint" role="status">
  <strong>{point.id} · {point.room}</strong> · {t(point.location)} · <a href={'#records/' + point.id}>{t("Inspection records")}</a>
</p>}
<div className="mstat"><div><span>{t("Distance today")}</span><b>{"186 m"}</b></div><div><span>{t("Average speed")}</span><b>{"0.3 m/s"}</b></div><div><span>{t("Obstacles avoided")}</span><b>{"3"}</b></div><div><span>{t("Position accuracy")}</span><b>{"± 8 cm"}</b></div></div>{" "}</section>{" "}<aside style={{"flex": "1 1 260px", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "14px"}}>{" "}<section className="pc plg" style={{"flex": "1"}}>{" "}<div className="plh"><h2 className="oh" style={{"margin": "0"}}>{t("Patrol log")}</h2><span className="plt">{t("Morning patrol")}</span></div>{" "}<div className="plp"><div className="plbar" role="progressbar" aria-label={t("Patrol time used")} aria-valuemin="0" aria-valuemax="75" aria-valuenow="44"><i style={{"width": "59%"}}></i></div>{" "}<div className="plnums"><span><b>{t("44 min")}</b>{" " + t("so far")}</span><span>{t("about") + " "}<b>{t("31 min")}</b>{" " + t("left")}</span></div></div>{" "}<ol className="pl"><li className="ok"><span className="pi"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5 10v10h14V10"></path></svg></span><div className="pb"><div className="pr"><strong>{t("Left dock")}</strong><time>{"09:58"}</time></div><span className="ps">{t("West wing, battery 96%")}</span></div></li><li className="bad"><span className="pi"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"></path></svg></span><div className="pb"><div className="pr"><strong>{"CP1 · UW-8-5"}</strong><time>{"10:12"}</time></div><span className="ps">{t("Water leak found")}</span>{" "}<a href="#alerts/INC-0231" className="pcard"><img className="incident-thumb" src={mapAlerts[0].photo} alt="" /><span><b>{"INC-0231"}</b><span>{t("High · 0.86 confidence")}</span></span></a></div></li><li className="warn"><span className="pi"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h10a3 3 0 1 0-3-3M4 12h15a3 3 0 1 1-3 3M4 16h7"></path></svg></span><div className="pb"><div className="pr"><strong>{"CP2 · UC-8-8"}</strong><time>{"10:31"}</time></div><span className="ps">{t("Air above limit")}</span>{" "}<div className="pchips"><span className="hot">{"PM2.5 41"}</span><span>{"24.6 °C"}</span><span>{"63% RH"}</span></div></div></li><li className="now"><span className="pi"><i className="pdot"></i></span><div className="pb"><div className="pr"><strong>{t("Heading to CP3 · UC-8-10")}</strong><time>{t("now")}</time></div><span className="ps">{t("Central corridor, 0.3 m/s")}</span>{" "}<div className="peta"><i style={{"width": "70%"}}></i></div><span className="ps" style={{"fontSize": "11px"}}>{t("about 4 min away")}</span></div></li><li className="todo"><span className="pi"></span><div className="pb"><div className="pr"><strong>{"CP4 · UC-8-11"}</strong><time>{"~10:58"}</time></div><span className="ps">{t("Then back to dock ~11:13")}</span></div></li></ol>{" "}<div className="nxa"><span>{t("Next patrol")}</span><b>{t("14:00 · afternoon")}</b><span>{t("4 checkpoints · about 75 min")}</span></div>{" "}</section>{" "}</aside>{" "}</div>{" "}<div style={{"display": "flex", "flexWrap": "wrap", "gap": "14px", "alignItems": "stretch"}}>{" "}<OpenIncidents incidents={incidents} responseHours={configuration.responseHours} language={language} t={t} />
<CheckpointAir configuration={configuration} t={t} />{" "}</div>{" "}</main>{" "}<footer style={{"marginTop": "auto", "padding": "18px 28px 24px", "display": "flex", "flexWrap": "wrap", "justifyContent": "space-between", "gap": "8px 20px", "fontSize": "12px", "color": "var(--c6E6E73)"}}><span>{t("© 2026 Campus Inspection Robot · IT Project, Sunway College")}</span><nav aria-label={t("Legal")} style={{"display": "flex", "flexWrap": "wrap", "gap": "16px"}}><a href="#legal/privacy" style={{"color": "var(--c3A3A3C)"}}>{t("Privacy Notice")}</a><a href="#legal/terms" style={{"color": "var(--c3A3A3C)"}}>{t("Terms of Use")}</a><a href="#legal/camera" style={{"color": "var(--c3A3A3C)"}}>{t("Camera and Image Policy")}</a><a href="#guidebook" style={{"color": "var(--c3A3A3C)"}}>{t("Guidebook")}</a></nav></footer>{" "}</div>{" "}</div>
</div>);
}
