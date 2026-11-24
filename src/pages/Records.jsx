import React from 'react';
import Sidebar from '../Sidebar.jsx';
import { exportSampleTables } from '../exportSampleTables.js';
import { sampleInspectionRecords } from '../inspectionRecords.js';
import RecordSearch from '../RecordSearch.jsx';

const PAGE_SIZE = 10;
const EMPTY_FILTERS = { q: '', cp: '', from: '', to: '', hz: '' };
const formatDay = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const hazardTones = { 'No hazard': 'ok', 'Water leak or stain': 'high', 'Wall crack': 'high', 'Floor obstruction': 'med' };

const displayTime = (record) => formatDay.format(new Date(record.day)) + ', ' + record.time;
const displayClimate = (record) => record.temperature.toFixed(1) + ' °C / ' + record.humidity + '%';
const displayParticles = (record) => record.pm25 + ' µg/m³' + (record.pm25Flag ? ' · above limit' : '');

function filterRecords({ q, cp, from, to, hz }) {
  const search = q.trim().toLowerCase();

  return sampleInspectionRecords.filter((record) => {
    if (cp && record.checkpoint !== cp) return false;
    if (from && record.day < from) return false;
    if (to && record.day > to) return false;
    if (hz && record.hazard !== hz) return false;

    const fields = [record.id, displayTime(record), record.location, record.hazard, displayClimate(record), displayParticles(record), record.status];
    return !search || fields.join(' ').toLowerCase().includes(search);
  });
}

function RecordSummary({ records }) {
  const metrics = [
    ['Sample checks', records.length],
    ['Hazards found', records.filter(record => record.hazard !== 'No hazard').length],
    ['PM2.5 above demo threshold', records.filter(record => record.pm25Flag).length],
    ['Checkpoints covered', new Set(records.map(record => record.checkpoint)).size],
  ];

  return (
    <section aria-label="Summary of matching sample records" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
      {metrics.map(([label, value]) => (
        <div className="card" key={label} style={{ gap: 2, padding: '14px 16px' }}>
          <span className="muted" style={{ fontSize: 12 }}>{label}</span>
          <strong style={{ fontSize: 24, fontWeight: 700 }}>{value}</strong>
        </div>
      ))}
    </section>
  );
}

function RecordRow({ record }) {
  const particles = displayParticles(record);
  return (
    <tr>
      <td style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{record.id}</td>
      <td><div className="thumb" role="img" aria-label="Sample photo placeholder" /></td>
      <td><time dateTime={record.day + 'T' + record.time + '+08:00'}>{displayTime(record)}</time></td>
      <td>{record.location}</td>
      <td><span className={'pill ' + hazardTones[record.hazard]}>{record.hazard}</span></td>
      <td>{displayClimate(record)}</td>
      <td>{record.pm25Flag ? <span className="pill med">{particles}</span> : particles}</td>
      <td className="muted">{record.status}</td>
    </tr>
  );
}

export default function Records() {
  const [filters, setFilters] = React.useState(EMPTY_FILTERS);
  const [page, setPage] = React.useState(0);
  const resultsPanel = React.useRef(null);
  const records = filterRecords(filters);
  const start = page * PAGE_SIZE;
  const visibleRecords = records.slice(start, start + PAGE_SIZE);
  const hasNext = start + visibleRecords.length < records.length;

  function updateFilter(name, value) {
    setFilters(current => ({ ...current, [name]: value }));
    setPage(0);
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setPage(0);
  }

  function showResults() {
    const panel = resultsPanel.current;
    panel?.focus({ preventScroll: true });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panel?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
  }

  function changePage(offset) {
    setPage(current => current + offset);
    showResults();
  }

  return (
    <div className="pg pg-records">
      <div style={{ minHeight: '100vh', margin: '0 auto', display: 'flex', flexWrap: 'wrap' }}>
        <a href="#main" className="skip">Skip to main content</a>
        <Sidebar />
        <div className="content">
          <main id="main" tabIndex={-1} style={{ padding: '22px 28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
              <h1 style={{ margin: 0, fontSize: 34, fontWeight: 700 }}>Records</h1>
              <button className="btn primary" type="button" disabled={visibleRecords.length === 0}
                onClick={event => exportSampleTables(event, 'sample-inspection-records.csv')}>
                Export visible sample records
              </button>
            </div>
            <RecordSearch filters={filters} onChange={updateFilter} onClear={clearFilters} onSearch={showResults} resultCount={records.length} />
            <RecordSummary records={records} />
            <section aria-label="Inspection results" ref={resultsPanel} tabIndex={-1} className="card" style={{ padding: '12px 12px 4px', scrollMarginTop: 16 }}>
              <div style={{ overflowX: 'auto' }}>
                <table id="inspection-records">
                  <caption className="sr">Sample inspection records matching the current filters</caption>
                  <thead>
                    <tr>
                      <th scope="col">Record ID</th>
                      <th scope="col">Image</th>
                      <th scope="col">Date and time</th>
                      <th scope="col">Checkpoint</th>
                      <th scope="col">Result</th>
                      <th scope="col">Temp / Humidity</th>
                      <th scope="col">PM2.5</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRecords.map(record => <RecordRow key={record.id} record={record} />)}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 6px 8px', fontSize: 13, flexWrap: 'wrap', gap: 8 }}>
                <span className="muted" role="status">
                  {records.length
                    ? <>Showing {start + 1}–{start + visibleRecords.length} of {records.length} sample records</>
                    : 'No records match these filters'}
                </span>
                <nav aria-label="Records pages" style={{ display: 'flex', gap: 6 }}>
                  <button className="btn" type="button" aria-controls="inspection-records" disabled={page === 0} onClick={() => changePage(-1)}>Previous</button>
                  <button className="btn" type="button" aria-controls="inspection-records" disabled={!hasNext} onClick={() => changePage(1)}>Next</button>
                </nav>
              </div>
            </section>
          </main>
          <footer style={{ marginTop: 'auto', padding: '18px 32px 26px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px 20px', fontSize: 12, color: 'var(--c6E6E73)', borderTop: '1px solid rgba(0,0,0,.08)' }}>
            <span>© 2026 Campus Inspection Robot · IT Project, Sunway College</span>
            <nav aria-label="Legal" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <a href="#legal/privacy" style={{ color: 'var(--c3A3A3C)' }}>Privacy Notice</a>
              <a href="#legal/terms" style={{ color: 'var(--c3A3A3C)' }}>Terms of Use</a>
              <a href="#legal/camera" style={{ color: 'var(--c3A3A3C)' }}>Camera and Image Policy</a>
              <a href="#legal/accessibility" style={{ color: 'var(--c3A3A3C)' }}>Accessibility</a>
            </nav>
          </footer>
        </div>
      </div>
    </div>
  );
}
