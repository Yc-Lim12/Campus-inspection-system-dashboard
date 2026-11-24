import React from 'react';

import { CHECKPOINT_ROOMS } from './inspectionRecords.js';

const CHECKPOINTS = [
  ['', 'Any checkpoint'],
  ...Object.entries(CHECKPOINT_ROOMS).map(([id, room]) => [id, id + ' · ' + room]),
];
const HAZARDS = [
  ['', 'Any hazard'],
  ['No hazard', 'No hazard'],
  ['Water leak or stain', 'Water leak or stain'],
  ['Wall crack', 'Wall crack'],
  ['Floor obstruction', 'Floor obstruction'],
];
const label = (pairs, v) => (pairs.find(([k]) => k === v) || pairs[0])[1];

export default function RecordSearch({ filters, onChange, onClear, onSearch, resultCount }) {
  const { q, cp, from, to, hz } = filters;
  const textInput = React.useRef(null);
  const active = Boolean(q.trim() || cp || from || to || hz);

  function clear() {
    onClear();
    textInput.current?.focus();
  }

  function submit(event) {
    event.preventDefault();
    onSearch();
  }

  return (
    <div className="rsx">
      <form className="rsx-bar" role="search" aria-label="Search records" onSubmit={submit}>
        <label className="rsx-seg rsx-what">
          <span className="rsx-k">What</span>
          <input
            ref={textInput}
            type="search"
            value={q}
            onChange={event => onChange('q', event.target.value)}
            placeholder="Record ID, incident or room"
            autoComplete="off"
          />
        </label>
        <label className="rsx-seg">
          <span className="rsx-k">Checkpoint</span>
          <span className={'rsx-v' + (cp ? '' : ' empty')}>{label(CHECKPOINTS, cp)}</span>
          <select value={cp} onChange={event => onChange('cp', event.target.value)}>
            {CHECKPOINTS.map(([k, l]) => <option key={l} value={k}>{l}</option>)}
          </select>
        </label>
        <label className={'rsx-seg rsx-date' + (from ? '' : ' empty')}>
          <span className="rsx-k">From</span>
          <input type="date" value={from} max={to || undefined} onChange={event => onChange('from', event.target.value)} />
        </label>
        <label className={'rsx-seg rsx-date' + (to ? '' : ' empty')}>
          <span className="rsx-k">To</span>
          <input type="date" value={to} min={from || undefined} onChange={event => onChange('to', event.target.value)} />
        </label>
        <label className="rsx-seg rsx-last">
          <span className="rsx-k">Hazard</span>
          <span className={'rsx-v' + (hz ? '' : ' empty')}>{label(HAZARDS, hz)}</span>
          <select value={hz} onChange={event => onChange('hz', event.target.value)}>
            {HAZARDS.map(([k, l]) => <option key={l} value={k}>{l}</option>)}
          </select>
        </label>
        <button className="rsx-go" type="submit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
          <span>Search</span>
        </button>
      </form>
      <p className="rsx-status">
        {active && (
          <>
            <span>
              {resultCount
                ? <><b>{resultCount}</b> matching sample records</>
                : 'No records match these filters'}
            </span>
            <button type="button" className="rsx-clear" onClick={clear}>Clear all</button>
          </>
        )}
      </p>
    </div>
  );
}
