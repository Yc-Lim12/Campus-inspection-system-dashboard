import React from 'react';
import { campusDayLabel, parseCampusDay } from './campusDates.js';
import { useDashboardLocale } from './dashboardLocale.js';

export default function DateFilter({ label, value, onChange, invalidRange = false }) {
  const { t } = useDashboardLocale();
  const id = React.useId();
  const [draft, setDraft] = React.useState(null);
  const [invalid, setInvalid] = React.useState(false);
  const picker = React.useRef(null);
  const textInput = React.useRef(null);
  const supportsPicker = typeof HTMLInputElement.prototype.showPicker === 'function';

  React.useEffect(() => {
    if (!value && document.activeElement !== textInput.current) {
      setDraft(null);
      setInvalid(false);
    }
  }, [value]);

  function update(text) {
    setDraft(text);
    setInvalid(false);
    const day = parseCampusDay(text);
    if (!text.trim() || day) onChange(day);
  }

  function commit() {
    if (draft === null) return;
    if (draft.trim() && !parseCampusDay(draft)) {
      setInvalid(true);
      return;
    }
    setDraft(null);
  }

  return (
    <div className="date-filter">
      <label htmlFor={id}>{label}</label>
      <div className="date-filter-control">
        <input ref={textInput} id={id} type="text" placeholder="DD MMM YYYY" autoComplete="off"
          value={draft ?? campusDayLabel(value)} aria-invalid={invalid || invalidRange || undefined}
          aria-describedby={invalid ? id + '-error' : undefined}
          onChange={event => update(event.target.value)} onBlur={commit} />
        {supportsPicker && <>
          <input type="date" className="date-filter-native" ref={picker} tabIndex={-1} aria-hidden="true" value={value}
            onChange={event => { onChange(event.target.value); setDraft(null); setInvalid(false); }} />
          <button type="button" className="date-filter-picker" aria-label={t('Open calendar for {label}', { label })}
            onClick={() => picker.current.showPicker()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <rect x="3.5" y="5.5" width="17" height="15" rx="2" /><path d="M7.5 3v5m9-5v5M4 10h16" />
            </svg>
          </button>
        </>}
      </div>
      {invalid && <span id={id + '-error'} className="muted date-filter-error">{t('Use DD MMM YYYY, for example 20 Nov 2026.')}</span>}
    </div>
  );
}
