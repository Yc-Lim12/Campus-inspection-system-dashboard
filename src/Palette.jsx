import React from 'react';
import { DemoCtx } from './ctx.js';
import { SEARCH } from './data.js';
const FILTERS = [['', 'All'], ['Incident', 'Incidents'], ['Checkpoint', 'Checkpoints'], ['Record', 'Records'], ['Page', 'Pages']];
function Hl({ s, v }) {
  if (!v) return s; const i = s.toLowerCase().indexOf(v); if (i < 0) return s;
  return <>{s.slice(0, i)}<mark>{s.slice(i, i + v.length)}</mark>{s.slice(i + v.length)}</>;
}
export default function Palette({ open, onClose }) {
  const { role } = React.useContext(DemoCtx);
  const [q, setQ] = React.useState(''); const [flt, setFlt] = React.useState(''); const [act, setAct] = React.useState(0);
  const input = React.useRef(null); const list = React.useRef(null);
  React.useEffect(() => { if (open) { setQ(''); setAct(0); setTimeout(() => input.current?.focus(), 10); } }, [open]);
  const v = q.trim().toLowerCase();
  const rows = SEARCH.filter((d) => (role === 'admin' || d.h !== 'admin') && (!flt || d.t === flt) && (!v || `${d.n} ${d.s} ${d.t}`.toLowerCase().includes(v)));
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
    <div id="cmdk" role="dialog" aria-modal="true" aria-label="Search" onKeyDown={onKey}>
      <div className="ck-back" onClick={onClose} />
      <div className="ck-box">
        <div className="ck-in">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input ref={input} autoFocus id="ck-q" type="search" value={q} onChange={(e) => { setQ(e.target.value); setAct(0); }} placeholder="Search incidents, rooms, records or pages" autoComplete="off" aria-controls="ck-list" />
          <button className="ck-close" type="button" aria-label="Close search" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="ck-chips">{FILTERS.map(([k, l]) => <button key={l} type="button" className={flt === k ? 'on' : ''} onClick={() => { setFlt(k); setAct(0); input.current?.focus(); }}>{l}</button>)}</div>
        <ul id="ck-list" role="listbox" ref={list}>
          {!rows.length && <li className="empty">No results for “{q}”. Try a room like UW-8-5 or an ID like INC-0231.</li>}
          {rows.map((d, k) => {
            const head = d.t !== g ? (g = d.t, <li className="gh" key={'h' + d.t}>{d.t}s</li>) : null;
            const sty = { background: `var(--c${d.c})`, color: `var(--c${d.f})` };
            return <React.Fragment key={d.n}>{head}<li><a href={'#' + d.h} role="option" aria-selected={k === act} className={k === act ? 'act' : ''} onMouseEnter={() => setAct(k)} onClick={onClose}>
              <span className="ic2" style={sty}>{d.i}</span>
              <span className="tt2"><b><Hl s={d.n} v={v} /></b><span><Hl s={d.s} v={v} /></span></span>
              {d.tag && <span className="tg3" style={sty}>{d.tag}</span>}
            </a></li></React.Fragment>;
          })}
        </ul>
        <div className="ck-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span className="ck-count">{rows.length ? `${rows.length} result${rows.length > 1 ? 's' : ''}` : ''}</span></div>
      </div>
    </div>
  );
}
