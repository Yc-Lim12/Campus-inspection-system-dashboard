import React from 'react';
import { useDashboardLocale } from './dashboardLocale.js';
import DateFilter from './DateFilter.jsx';

const HAZARDS = [
  ['', 'Any hazard'],
  ['No hazard', 'No hazard'],
  ['Water leak or stain', 'Water leak or stain'],
  ['Wall crack', 'Wall crack'],
  ['Floor obstruction', 'Floor obstruction'],
  ['Minor floor obstruction', 'Minor floor obstruction'],
  ['Air above limit', 'Air above limit'],
];
const label = (pairs, v) => (pairs.find(([k]) => k === v) || pairs[0])[1];

export default function RecordSearch({ filters, checkpoints, onChange, onClear, onSearch, resultCount }) {
  const { t } = useDashboardLocale();
  const { q, cp, from, to, hz } = filters;
  const points = [['', 'Any checkpoint'], ...checkpoints.map(({ id, room }) => [id, id + ' · ' + room])];
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
      <form className="rsx-bar" role="search" aria-label={t("Search records")} onSubmit={submit}>
        <label className="rsx-seg rsx-what">
          <span className="rsx-k">{t("What")}</span>
          <input
            ref={textInput}
            type="search"
            value={q}
            onChange={event => onChange('q', event.target.value)}
            placeholder={t("Record ID, incident or room")}
            autoComplete="off"
          />
        </label>
        <label className="rsx-seg">
          <span className="rsx-k">{t("Checkpoint")}</span>
          <span className={'rsx-v' + (cp ? '' : ' empty')}>{t(label(points, cp))}</span>
          <select value={cp} onChange={event => onChange('cp', event.target.value)}>
            {points.map(([k, l]) => <option key={k} value={k}>{t(l)}</option>)}
          </select>
        </label>
        <div className="rsx-seg rsx-date"><DateFilter label={t('From')} value={from} invalidRange={Boolean(from && to && from > to)}
          onChange={value => onChange('from', value)} /></div>
        <div className="rsx-seg rsx-date"><DateFilter label={t('To')} value={to} invalidRange={Boolean(from && to && from > to)}
          onChange={value => onChange('to', value)} /></div>
        <label className="rsx-seg">
          <span className="rsx-k">{t("Hazard")}</span>
          <span className={'rsx-v' + (hz ? '' : ' empty')}>{t(label(HAZARDS, hz))}</span>
          <select value={hz} onChange={event => onChange('hz', event.target.value)}>
            {HAZARDS.map(([k, l]) => <option key={l} value={k}>{t(l)}</option>)}
          </select>
        </label>
        <button className="rsx-go" type="submit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
          <span>{t("Search")}</span>
        </button>
      </form>
      {from && to && from > to && <p className="report-error" role="alert">{t('The start date must be on or before the end date.')}</p>}
      <p className="rsx-status">
        {active && (
          <>
            <span>
              {resultCount
                ? t('{count} matching sample records', { count: resultCount })
                : t('No records match these filters')}
            </span>
            <button type="button" className="rsx-clear" onClick={clear}>{t("Clear all")}</button>
          </>
        )}
      </p>
    </div>
  );
}
