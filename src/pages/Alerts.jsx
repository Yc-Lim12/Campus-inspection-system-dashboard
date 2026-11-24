import React from 'react';
import { useDashboardLocale } from '../dashboardLocale.js';
import DashboardPage, { WorkflowDialog } from '../DashboardPage.jsx';
import RobotControls from '../RobotControls.jsx';
import { DEMO_INCIDENT_TRANSITIONS, DemoCtx } from '../ctx.js';
import { campusTime, checkpointLabel } from '../dashboardState.js';
import { INCIDENT_LABELS } from '../incidents.js';
import { prefersReducedMotion } from '../preferences.js';

const actions = { acknowledged: 'Acknowledge', reported: 'Mark as reported', on_hold: 'Put on hold', resolved: 'Resolve incident' };
const severities = ['High', 'Medium', 'Low'];

function localizeActivity(message, t) {
  return message.split(' · ').map(part => {
    if (part.startsWith('Assigned to ')) return t('Assigned to {person}', { person: t(part.slice(12)) });
    if (part.startsWith('Work order ')) return t('Work order {number}', { number: part.slice(11) });
    return t(part);
  }).join(' · ');
}

function NewAlert({ onClose, onCreate }) {
  const { t } = useDashboardLocale();
  const { configuration, addIncident } = React.useContext(DemoCtx);
  const checkpoints = configuration.checkpoints.filter(item => item.active);

  function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = data.get('title').trim();
    if (!title) return;
    const checkpoint = checkpoints.find(item => item.id === data.get('checkpoint'));
    if (!checkpoint) return;
    const id = addIncident({ title, checkpoint: checkpoint.id, room: checkpoint.room, severity: data.get('severity') });
    location.hash = '#alerts/' + id;
    onCreate();
  }

  return (
    <WorkflowDialog title={t("Report an alert")} onClose={onClose}>
      <form className="workflow-form" onSubmit={submit}>
        <label>{t("Hazard description")}<input name="title" required maxLength={120} /></label>
        <label>{t("Checkpoint")}<select name="checkpoint" required>
          {checkpoints.map(item => <option key={item.id} value={item.id}>{checkpointLabel(checkpoints, item.id)}</option>)}
        </select></label>
        <label>{t("Severity")}<select name="severity" defaultValue="Medium">
          {severities.map(severity => <option key={severity} value={severity}>{t(severity)}</option>)}
        </select></label>
        {checkpoints.length === 0 && <p>{t("Activate a checkpoint in Admin before reporting an alert.")}</p>}
        <div className="workflow-actions">
          <button className="btn primary" type="submit" disabled={!checkpoints.length}>{t("Create alert")}</button>
          <button className="btn" type="button" onClick={onClose}>{t("Cancel")}</button>
        </div>
      </form>
    </WorkflowDialog>
  );
}

function AlertDetails({ incident, panel }) {
  const { language, t } = useDashboardLocale();
  const { configuration, updateIncident } = React.useContext(DemoCtx);
  const [dialog, setDialog] = React.useState(null);
  const assignments = [...new Set(['Unassigned', 'Facilities Management', ...configuration.people.map(person => person.email)])];

  function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const assignment = data.get('assignment');
    const workOrder = data.get('workOrder')?.trim();
    const note = data.get('note')?.trim();
    const changes = { workOrder, note };
    if (assignment !== null) changes.assignment = assignment;
    if (dialog === 'reported') changes.status = dialog;
    if (dialog === 'note' && !note) return;
    updateIncident(incident, changes);
    setDialog(null);
  }

  return (
    <section className="card workflow-panel" aria-labelledby="active-alert" tabIndex={-1} ref={panel}>
      <header className="workflow-heading">
        <div><p className="muted">{incident.id}</p><h2 id="active-alert">{t(incident.title)}</h2></div>
        <span className="pill">{t(incident.severity)} · {t(INCIDENT_LABELS[incident.status])}</span>
      </header>
      <dl className="workflow-facts">
        <div><dt>{t("Checkpoint")}</dt><dd>{incident.checkpoint} · {incident.room}</dd></div>
        <div><dt>{t("Detected")}</dt><dd>{incident.day} {incident.time}</dd></div>
        <div><dt>{t("Assigned to")}</dt><dd>{t(incident.assignment)}</dd></div>
        {incident.workOrder && <div><dt>{t("Work order")}</dt><dd>{incident.workOrder}</dd></div>}
        {incident.pm25 && <div><dt>PM2.5</dt><dd>{incident.pm25} µg/m³</dd></div>}
        {incident.confidence && <div><dt>{t("Confidence")}</dt><dd>{Math.round(incident.confidence * 100)}%</dd></div>}
      </dl>
      <div className="workflow-actions">
        {DEMO_INCIDENT_TRANSITIONS[incident.status].map(status => (
          <button className={status === 'on_hold' ? "btn" : "btn primary"} type="button" key={status} onClick={() =>
            status === 'reported' ? setDialog(status) : updateIncident(incident, { status })}>{t(actions[status])}</button>
        ))}
        <button className="btn" type="button" onClick={() => setDialog('assignment')}>{t("Reassign")}</button>
        <button className="btn" type="button" onClick={() => setDialog('note')}>{t("Add note")}</button>
        <a className="btn" href={'#records/' + incident.checkpoint}>{t("Past records")}</a>
        <RobotControls onlyRecheck={incident.checkpoint} />
      </div>
      <h3>{t("Activity")}</h3>
      {incident.history.length ? (
        <ol className="workflow-list">{incident.history.map(({ timestamp, message, status, assignment, workOrder, note }, index) => (
          <li key={index}><time dateTime={new Date(timestamp).toISOString()}>{campusTime(timestamp, language)}</time> · {
            message ? localizeActivity(message, t) : [
              status && t(INCIDENT_LABELS[status]),
              assignment && t('Assigned to {person}', { person: t(assignment) }),
              workOrder && t('Work order {number}', { number: workOrder }),
              note,
            ].filter(Boolean).join(' · ')
          }</li>
        ))}</ol>
      ) : <p className="muted">{t("No updates recorded.")}</p>}
      {dialog && (
        <WorkflowDialog title={t(actions[dialog] || (dialog === 'note' ? 'Add note' : 'Reassign alert'))} onClose={() => setDialog(null)}>
          <form className="workflow-form" onSubmit={submit}>
            {dialog !== 'note' && (
              <label>{t("Assigned to")}<select name="assignment" defaultValue={dialog === 'reported' ? 'Facilities Management' : incident.assignment}>
                {assignments.map(name => <option key={name} value={name}>{t(name)}</option>)}
              </select></label>
            )}
            {dialog === 'reported' && <label>{t("Work order number")}<input name="workOrder" maxLength={60} /></label>}
            {dialog !== 'assignment' && <label>{t("Note")}<textarea name="note" required={dialog === 'note'} maxLength={500} /></label>}
            <div className="workflow-actions">
              <button className="btn primary" type="submit">{t("Save")}</button>
              <button className="btn" type="button" onClick={() => setDialog(null)}>{t("Cancel")}</button>
            </div>
          </form>
        </WorkflowDialog>
      )}
    </section>
  );
}

export default function Alerts({ section }) {
  const { t } = useDashboardLocale();
  const { incidents } = React.useContext(DemoCtx);
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [creating, setCreating] = React.useState(false);
  const details = React.useRef(null);
  const matches = incidents.filter(incident =>
    (status === 'all' || (status === 'open' ? incident.status !== 'resolved' : incident.status === 'resolved')) &&
    [incident.id, incident.title, t(incident.title), incident.checkpoint, incident.room].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  const selected = matches.find(incident => incident.id === section) || matches[0];

  React.useEffect(() => {
    const panel = details.current;
    if (!section || !panel || !window.matchMedia('(max-width: 760px)').matches) return;
    panel.focus({ preventScroll: true });
    panel.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
  }, [section]);

  return (
    <DashboardPage title={t("Alerts")} className="pg-alerts" actions={<button className="btn primary" type="button" onClick={() => setCreating(true)}>{t("Report alert")}</button>}>
      <div className="workflow-split">
        <section className="card workflow-panel" aria-label={t("Incident list")}>
          <div className="workflow-form">
            <label>{t("Search alerts")}<input type="search" placeholder={t("ID, room or hazard")} value={query} onChange={event => setQuery(event.target.value)} /></label>
            <label>{t("Status")}<select value={status} onChange={event => setStatus(event.target.value)}>
              <option value="all">{t("All alerts")}</option><option value="open">{t("Unresolved")}</option><option value="resolved">{t("Resolved")}</option>
            </select></label>
          </div>
          <div className="workflow-list alert-links">
            {matches.map(incident => (
              <a key={incident.id} className={'item' + (selected?.id === incident.id ? ' on' : '')}
                aria-current={selected?.id === incident.id ? 'true' : undefined} href={'#alerts/' + incident.id}>
                <strong>{t(incident.title)}</strong><span>{incident.id} · {incident.checkpoint}</span>
                <span>{t(incident.severity)} · {t(INCIDENT_LABELS[incident.status])}</span>
              </a>
            ))}
            {matches.length === 0 && <p role="status">{t("No alerts match.")}</p>}
          </div>
        </section>
        {selected && <AlertDetails key={selected.id} incident={selected} panel={details} />}
      </div>
      {creating && <NewAlert onClose={() => setCreating(false)}
        onCreate={() => { setCreating(false); setQuery(''); setStatus('all'); }} />}
    </DashboardPage>
  );
}
