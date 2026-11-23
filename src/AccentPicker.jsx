import React from 'react';

/* Accent colour preview. Sets data-accent on <html>; refresh.css maps each
   value to the accent tokens. Choice is kept in localStorage ("ci-accent"). */

export const ACCENTS = [
  { id: 'indigo', name: 'Indigo', hex: '#5B5FE6', note: 'Linear. Distinct from every status colour.' },
  { id: 'blue', name: 'Blue', hex: '#0071E3', note: 'Apple. Familiar and safe.' },
  { id: 'teal', name: 'Teal', hex: '#0F8B8D', note: 'Calm, Muji-like. Sits near “resolved” green.' },
  { id: 'graphite', name: 'Graphite', hex: '#1D1D1F', note: 'Notion / Framer. No colour, black only.' },
  { id: 'coral', name: 'Coral', hex: '#FF385C', note: 'Airbnb. Clashes with “high” alert red.' },
];

const KEY = 'ci-accent';
const read = () => { try { return localStorage.getItem(KEY) || 'indigo'; } catch { return 'indigo'; } };

export function applyAccent(id) {
  const el = document.documentElement;
  if (id === 'indigo') el.removeAttribute('data-accent'); else el.setAttribute('data-accent', id);
}

export default function AccentPicker() {
  const [accent, setAccent] = React.useState(read);
  const pick = (id) => {
    setAccent(id);
    applyAccent(id);
    try { localStorage.setItem(KEY, id); } catch {}
  };
  const current = ACCENTS.find((a) => a.id === accent) || ACCENTS[0];
  return (
    <div className="li accent-row">
      <span className="accent-text">
        <span id="accent-l">Accent colour</span>
        <small>{current.note}</small>
      </span>
      <fieldset className="accent-swatches" aria-labelledby="accent-l">
        {ACCENTS.map((a) => (
          <label key={a.id} className="accent-swatch" title={a.name}>
            <input type="radio" name="accent" value={a.id} checked={accent === a.id} onChange={() => pick(a.id)} />
            <i style={{ background: a.hex }} aria-hidden="true" />
            <span>{a.name}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
