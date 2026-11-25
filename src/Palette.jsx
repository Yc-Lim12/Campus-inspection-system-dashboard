import React from 'react';
import { useDashboardLocale } from './dashboardLocale.js';
import { DemoCtx } from './ctx.js';
import { SEARCH } from './data.js';
import { sampleInspectionRecords } from './inspectionRecords.js';
import { INCIDENT_LABELS, incidentTimestamp } from './incidents.js';
import { campusTime } from './dashboardState.js';
const FILTERS = [['', 'All'], ['Incident', 'Incidents'], ['Checkpoint', 'Checkpoints'], ['Record', 'Records'], ['Page', 'Pages']];
function Hl({ s, v }) {
  if (!v) return s; const i = s.toLowerCase().indexOf(v); if (i < 0) return s;
  return <>{s.slice(0, i)}<mark>{s.slice(i, i + v.length)}</mark>{s.slice(i + v.length)}</>;
}
export default function Palette({ open, onClose }) {
  const { language, t } = useDashboardLocale();
  const { role, incidents, configuration } = React.useContext(DemoCtx);
  const [q, setQ] = React.useState(''); const [flt, setFlt] = React.useState(''); const [act, setAct] = React.useState(0);
  const input = React.useRef(null); const list = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    setQ('');
    setFlt('');
    setAct(0);
    input.current?.focus();
  }, [open]);
  const v = q.trim().toLowerCase();
  const entries = [
    ...incidents.map(item => ({
      t: 'Incident', n: item.id + ' · ' + t(item.title), s: item.checkpoint + ' · ' + item.room + ' · ' + t(INCIDENT_LABELS[item.status]),
      h: 'alerts/' + item.id, c: 'F9E3E1', f: 'C2413D', i: '!', tag: t(item.severity),
    })),
    ...configuration.checkpoints.map(item => ({
      t: 'Checkpoint', n: item.id + ' · ' + item.room, s: t(item.location), h: 'overview/' + item.id, c: 'E6EEFA', f: '1E4F8C', i: item.id.slice(2),
    })),
    ...sampleInspectionRecords.map(item => {
      const incident = incidents.find(entry => entry.id === item.status.split(' · ')[0]);
      const status = incident ? [incident.id, INCIDENT_LABELS[incident.status]] : item.status.split(' · ');
      return {
        t: 'Record', n: item.id + ' · ' + item.location,
        s: [campusTime(incidentTimestamp(item.day, item.time), language), t(item.hazard), ...status.map(part => t(part))].join(' · '),
        h: 'records/' + item.id, c: 'F2F4F7', f: '3A3A3C', i: 'R',
      };
    }),
    ...SEARCH.map(entry => ({ ...entry, n: t(entry.n), s: t(entry.s) })),
  ];
  const rows = entries.filter((d) => (role === 'admin' || d.h !== 'admin') && (!flt || d.t === flt) && (!v || `${d.n} ${d.s} ${d.t}`.toLowerCase().includes(v)));
  React.useEffect(() => { list.current?.querySelector('a.act')?.scrollIntoView({ block: 'nearest' }); }, [act]);
  if (!open) return null;
  const go = (d) => { location.hash = '#' + d.h; onClose(); };
  const onKey = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.target !== input.current) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAct((current) => Math.min(current + 1, Math.max(rows.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAct((current) => Math.max(current - 1, 0));
    } else if (e.key === 'Enter' && rows[act]) {
      go(rows[act]);
    }
  };
  let g = '';
  return (
    <div id="cmdk" role="dialog" aria-modal="true" aria-label={t("Search")} onKeyDown={onKey}>
      <div className="ck-back" onClick={onClose} />
      <div className="ck-box">
        <div className="ck-in">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input ref={input} autoFocus id="ck-q" type="search" value={q} onChange={(e) => { setQ(e.target.value); setAct(0); }} placeholder={t("Search incidents, rooms, records or pages")} autoComplete="off" aria-controls="ck-list" />
          <button className="ck-close" type="button" aria-label={t("Close search")} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="ck-chips">{FILTERS.map(([k, l]) => <button key={l} type="button" className={flt === k ? 'on' : ''} onClick={() => { setFlt(k); setAct(0); input.current?.focus(); }}>{t(l)}</button>)}</div>
        <ul id="ck-list" role="listbox" ref={list}>
          {!rows.length && <li className="empty">{t('No results for “{query}”. Try a room like UW-8-5 or an ID like INC-0231.', { query: q })}</li>}
          {rows.map((d, k) => {
            const head = d.t !== g ? (g = d.t, <li className="gh" key={'h' + d.t}>{t(FILTERS.find(([key]) => key === d.t)?.[1] || d.t)}</li>) : null;
            const sty = { background: `var(--c${d.c})`, color: `var(--c${d.f})` };
            return <React.Fragment key={d.n}>{head}<li><a href={'#' + d.h} role="option" aria-selected={k === act} className={k === act ? 'act' : ''} onMouseEnter={() => setAct(k)} onClick={onClose}>
              <span className="ic2" style={sty}>{d.i}</span>
              <span className="tt2"><b><Hl s={d.n} v={v} /></b><span><Hl s={d.s} v={v} /></span></span>
              {d.tag && <span className="tg3" style={sty}>{d.tag}</span>}
            </a></li></React.Fragment>;
          })}
        </ul>
        <div className="ck-foot"><span><kbd>↑</kbd><kbd>↓</kbd>{" " + t("move")}</span><span><kbd>Enter</kbd>{" " + t("open")}</span><span className="ck-count">{rows.length ? t(rows.length === 1 ? '{count} result' : '{count} results', { count: rows.length }) : ''}</span></div>
      </div>
    </div>
  );
}
