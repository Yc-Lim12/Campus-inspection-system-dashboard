import React from 'react';

/* Airbnb-style segmented search for the Records table.
   Filters the rendered table rows live; the round button applies and
   moves focus to the results. */

const CHECKPOINTS = [
  ['', 'Any checkpoint'],
  ['CP1', 'CP1 · UW-8-5'],
  ['CP2', 'CP2 · UC-8-8'],
  ['CP3', 'CP3 · UC-8-10'],
  ['CP4', 'CP4 · UC-8-11'],
];
const HAZARDS = [
  ['', 'Any hazard'],
  ['No hazard', 'No hazard'],
  ['Water leak or stain', 'Water leak or stain'],
  ['Wall crack', 'Wall crack'],
  ['Floor obstruction', 'Floor obstruction'],
];
const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const YEAR = 2026;

// "20 Nov, 10:31" -> "2026-11-20" so it compares with <input type="date"> values.
function rowDay(text) {
  const m = /^(\d{1,2}) (\w{3})/.exec(text.trim());
  if (!m || !(m[2] in MONTHS)) return '';
  return `${YEAR}-${String(MONTHS[m[2]] + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

const label = (pairs, v) => (pairs.find(([k]) => k === v) || pairs[0])[1];

export default function RecordSearch() {
  const [q, setQ] = React.useState('');
  const [cp, setCp] = React.useState('');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [hz, setHz] = React.useState('');
  const [counts, setCounts] = React.useState(null);
  const root = React.useRef(null);
  const textInput = React.useRef(null);

  const active = Boolean(q.trim() || cp || from || to || hz);

  React.useEffect(() => {
    const table = root.current?.closest('main')?.querySelector('table');
    const rows = table ? [...table.tBodies[0].rows] : [];
    const needle = q.trim().toLowerCase();
    let shown = 0;
    rows.forEach((tr) => {
      const c = tr.cells;
      const day = rowDay(c[2]?.textContent || '');
      const ok =
        (!needle || tr.textContent.toLowerCase().includes(needle)) &&
        (!cp || (c[3]?.textContent || '').startsWith(cp)) &&
        (!hz || (c[4]?.textContent || '').trim() === hz) &&
        (!from || (day && day >= from)) &&
        (!to || (day && day <= to));
      tr.hidden = !ok;
      if (ok) shown += 1;
    });
    setCounts({ shown, total: rows.length });
  }, [q, cp, from, to, hz]);

  const clear = () => {
    setQ(''); setCp(''); setFrom(''); setTo(''); setHz('');
    textInput.current?.focus();
  };

  const submit = (e) => {
    e.preventDefault();
    const table = root.current?.closest('main')?.querySelector('table');
    table?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="rsx" ref={root}>
      <form className="rsx-bar" role="search" aria-label="Search records" onSubmit={submit}>
        <label className="rsx-seg rsx-what">
          <span className="rsx-k">What</span>
          <input
            ref={textInput}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Record ID, incident or room"
            autoComplete="off"
          />
        </label>
        <label className="rsx-seg">
          <span className="rsx-k">Checkpoint</span>
          <span className={'rsx-v' + (cp ? '' : ' empty')}>{label(CHECKPOINTS, cp)}</span>
          <select value={cp} onChange={(e) => setCp(e.target.value)}>
            {CHECKPOINTS.map(([k, l]) => <option key={l} value={k}>{l}</option>)}
          </select>
        </label>
        <label className={'rsx-seg rsx-date' + (from ? '' : ' empty')}>
          <span className="rsx-k">From</span>
          <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className={'rsx-seg rsx-date' + (to ? '' : ' empty')}>
          <span className="rsx-k">To</span>
          <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
        </label>
        <label className="rsx-seg rsx-last">
          <span className="rsx-k">Hazard</span>
          <span className={'rsx-v' + (hz ? '' : ' empty')}>{label(HAZARDS, hz)}</span>
          <select value={hz} onChange={(e) => setHz(e.target.value)}>
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
      <p className="rsx-status" aria-live="polite">
        {active && counts && (
          <>
            <span>
              {counts.shown
                ? <>Showing <b>{counts.shown}</b> of {counts.total} records on this page</>
                : 'No records match these filters'}
            </span>
            <button type="button" className="rsx-clear" onClick={clear}>Clear all</button>
          </>
        )}
      </p>
    </div>
  );
}
