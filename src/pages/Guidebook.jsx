import React from 'react';
import { useDashboardLocale } from '../dashboardLocale.js';
import DashboardPage from '../DashboardPage.jsx';
import { prefersReducedMotion } from '../preferences.js';

const sections = [
  {
    id: 'alerts', label: 'Responding to alerts', title: 'When an alert comes in',
    description: 'Open the alert, check the photo, then follow the steps for its type.',
    topics: [
      {
        title: 'Water leak or stain',
        steps: [
          'Check the photo. If water is on the floor, place a wet floor sign or cordon off the area.',
          'Report it to Facilities Management through the usual work order channel.',
          'Mark the alert as Reported and add the work order number.',
          'When fixed, mark it Resolved. The robot rechecks it on the next patrol.',
        ],
        note: 'Why: under the OSH Act 1994 the employer must keep the workplace safe for staff and others in it, such as students and visitors.',
      },
      {
        title: 'Wall crack',
        steps: [
          'Compare with earlier photos in Records to see if it is growing.',
          'Report to Facilities Management. A new or widening crack is High severity.',
          'Only a qualified person (e.g. building engineer) decides if it is structural.',
        ],
      },
      {
        title: 'Floor obstruction or blocked exit',
        steps: [
          'Clear small items yourself if it is safe to do so.',
          'A blocked fire exit or escape route is urgent. Clear it or report it at once.',
        ],
        note: 'Why: a blocked escape route is a fire hazard under the Fire Services Act 1988.',
      },
      {
        title: 'Air quality above limit',
        steps: [
          'Check the reading trend. One spike may be a passing cause (cleaning, cooking).',
          'If it stays high, report it to Facilities Management to check the air-conditioning and ventilation.',
          'If it cannot be fixed, building management arranges an IAQ assessment by a DOSH-registered assessor.',
        ],
        note: "Why: the limits and the complaint steps follow DOSH's Industry Code of Practice on Indoor Air Quality 2010. The office temperature range there is 23–26 °C.",
      },
    ],
  },
  {
    id: 'robot', label: 'Robot safety', title: 'Using the robot safely',
    steps: [
      'Stop robot pauses the robot simulator from the Overview and Camera pages. Use the approved on-site safety procedure during real operation.',
      'The robot also has a physical emergency stop button on its body.',
      'Do not lift, push or block the robot while it is moving.',
      'If the battery is below 20%, send it back with Return.',
    ],
  },
  {
    id: 'privacy', label: 'Privacy', title: 'Privacy: your duties',
    steps: [
      'Use Simulate photo request only for work, such as checking the robot or an area.',
      'Do not download or share robot photos outside work.',
      'Before collecting real photos, agree with the university on how staff should report a privacy issue and who can review images.',
      'This demo does not log image views.',
    ],
    note: 'Photos of identifiable people are personal data under the Personal Data Protection Act 2010.',
    link: ['Read the Privacy Notice', '#legal/privacy'],
  },
  {
    id: 'laws', label: 'Policies', title: 'Laws and codes this system follows',
    references: [
      ['Personal Data Protection Act 2010 (Act 709)', 'Camera, photos, accounts'],
      ['Occupational Safety and Health Act 1994 (Act 514, amended 2022)', 'Hazard reporting'],
      ['ICOP on Indoor Air Quality 2010 (DOSH)', 'Air limits, complaints'],
      ['Fire Services Act 1988 (Act 341)', 'Blocked exits'],
      ['Persons with Disabilities Act 2008 and WCAG 2.1 AA', 'Accessibility'],
    ],
    note: "This is a plain-language summary for staff, not legal advice. Sunway's own policies and Facilities Management procedures come first.",
  },
];

function GuideBody({ entry, ordered = false, t }) {
  const List = ordered ? 'ol' : 'ul';
  return (
    <div className="guide-body">
      {entry.steps && <List>{entry.steps.map(step => <li key={step}>{t(step)}</li>)}</List>}
      {entry.references?.map(([name, scope]) => (
        <div className="guide-reference" key={name}><strong>{t(name)}</strong><span>{t(scope)}</span></div>
      ))}
      {entry.note && <p className="guide-topic-note muted">{t(entry.note)}{entry.link && <> <a href={entry.link[1]}>{t(entry.link[0])}</a></>}</p>}
    </div>
  );
}

export default function Guidebook() {
  const { t } = useDashboardLocale();
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState({ 'Water leak or stain': true });
  const [closedResults, setClosedResults] = React.useState({});
  const searchInput = React.useRef(null);
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const searching = terms.length > 0;
  const matches = (...fields) => {
    const text = fields.filter(Boolean).flatMap(field => [field, t(field)]).join(' ').toLowerCase();
    return terms.every(term => text.includes(term));
  };

  const visibleSections = sections.flatMap(section => {
    if (!section.topics) return matches(section.title, section.label, ...(section.steps || []), ...(section.references?.flat() || []), section.note) ? [section] : [];
    const topics = section.topics.filter(topic => matches(section.title, section.label, section.description, topic.title, ...topic.steps, topic.note));
    return topics.length ? [{ ...section, topics }] : [];
  });
  const count = visibleSections.reduce((total, section) => total + (section.topics?.length ?? 1), 0);

  function updateQuery(value) {
    setQuery(value);
    setClosedResults({});
  }

  function clearSearch() {
    updateQuery('');
    searchInput.current?.focus();
  }

  function jump(id) {
    const heading = document.getElementById('guide-' + id);
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
  }

  function toggleTopic(title) {
    if (searching) setClosedResults(current => ({ ...current, [title]: !current[title] }));
    else setOpen(current => ({ ...current, [title]: !current[title] }));
  }

  return (
    <DashboardPage title={t("Guidebook")} className="pg-guidebook"
      description={t("Find the next step for an alert, robot operation, or a privacy question.")}>
      <section className="card guide-search" aria-label={t("Find guidance")}>
        <div className="guide-search-row">
          <label htmlFor="hq">{t("Search the guidebook")}</label>
          <div className="guide-input">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input id="hq" ref={searchInput} type="search" value={query} onChange={event => updateQuery(event.target.value)}
              placeholder={t("Water leak, PM2.5, stop robot…")} autoComplete="off" />
          </div>
          {query && <button className="btn" type="button" onClick={clearSearch}>{t("Clear search")}</button>}
        </div>
        {searching ? <p className="muted" role="status">{count ? t(count === 1 ? '{count} matching topic' : '{count} matching topics', { count }) : t('No guidebook topics match.')}</p>
          : <nav className="workflow-actions" aria-label={t("Guidebook topics")}>
              {sections.map(section => <button key={section.id} type="button" className="btn" onClick={() => jump(section.id)}>{t(section.label)}</button>)}
            </nav>}
      </section>
      <div className="guide-sections">
        {visibleSections.map(section => (
          <section key={section.id} className={'card guide-section' + (section.topics ? ' guide-alerts' : '')} aria-labelledby={'guide-' + section.id}>
            <header>
              <h2 id={'guide-' + section.id} tabIndex={-1}>{t(section.title)}</h2>
              {section.description && <p className="muted">{t(section.description)}</p>}
            </header>
            {section.topics ? section.topics.map(topic => (
              <details key={topic.title} open={searching ? !closedResults[topic.title] : Boolean(open[topic.title])} className="guide-topic">
                <summary onClick={event => { event.preventDefault(); toggleTopic(topic.title); }}>{t(topic.title)}</summary>
                <GuideBody entry={topic} ordered t={t} />
              </details>
            )) : <GuideBody entry={section} t={t} />}
          </section>
        ))}
      </div>
      <section className="card guide-help" aria-labelledby="guide-help">
        <div><h2 id="guide-help">{t("Need more help?")}</h2><p className="muted">{t("Ask the Assistant or find the project’s contact guidance.")}</p></div>
        <div className="workflow-actions">
          <a className="btn primary" href="#assistant">{t("Open Assistant")}</a>
          <a className="btn" href="#legal/contact">{t("Project support")}</a>
        </div>
      </section>
    </DashboardPage>
  );
}
