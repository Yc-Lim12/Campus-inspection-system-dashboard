import React from 'react';
import { useDashboardLocale } from '../dashboardLocale.js';
import DashboardPage, { WorkflowDialog } from '../DashboardPage.jsx';
import RobotControls from '../RobotControls.jsx';
import { DEMO_INCIDENT_TRANSITIONS, DemoCtx } from '../ctx.js';
import { campusTime, checkpointLabel } from '../dashboardState.js';
import { INCIDENT_LABELS, RESPONSE_HOURS, incidentTimestamp, responseDeadline } from '../incidents.js';
import { campusDayLabel } from '../campusDates.js';
import { prefersReducedMotion } from '../preferences.js';

const actions = { acknowledged: 'Acknowledge', reported: 'Mark as reported', on_hold: 'Put on hold', resolved: 'Resolve incident' };
const severities = Object.keys(RESPONSE_HOURS);

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

function AlertDetails({ incident, panel, onResolved }) {
  const { language, t } = useDashboardLocale();
  const { configuration, updateIncident } = React.useContext(DemoCtx);
  const [dialog, setDialog] = React.useState(null);
  const [now, setNow] = React.useState(Date.now);
  const deadline = responseDeadline(incident, configuration.responseHours, t, now);
  const assignments = [...new Set(['Unassigned', 'Facilities Management', ...configuration.people.map(person => person.email)])];

  React.useEffect(() => {
    if (incident.sample || incident.status === 'resolved') return;
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, [incident.sample, incident.status]);

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
    <section className="card workflow-panel alert-detail" aria-labelledby="active-alert" tabIndex={-1} ref={panel}>
      <header className="workflow-heading">
        <div><p className="muted">{incident.id}</p><h2 id="active-alert">{t(incident.title)}</h2></div>
        <span className="report-severity" data-severity={incident.severity}>{t(incident.severity)} · {t(INCIDENT_LABELS[incident.status])}</span>
      </header>
      {incident.photo && (
        <figure className="alert-evidence">
          <img src={incident.photo} alt={t('Sample water leak on a corridor floor')} />
          <figcaption>{t('Sample photo evidence (AI-generated)')}</figcaption>
        </figure>
      )}
      <dl className="workflow-facts">
        <div><dt>{t("Checkpoint")}</dt><dd>{incident.checkpoint} · {incident.room}</dd></div>
        <div><dt>{t("Detected")}</dt><dd>{incident.time ? campusTime(incidentTimestamp(incident.day, incident.time), language) : campusDayLabel(incident.day)}</dd></div>
        <div><dt>{t("Assigned to")}</dt><dd>{t(incident.assignment)}</dd></div>
        {incident.workOrder && <div><dt>{t("Work order")}</dt><dd>{incident.workOrder}</dd></div>}
        {incident.pm25 && <div><dt>PM2.5</dt><dd>{incident.pm25} µg/m³</dd></div>}
        {incident.confidence != null && <div><dt>{t("AI confidence")}</dt><dd>{incident.confidence.toFixed(2)}</dd></div>}
        {deadline && <div><dt>{t('Response deadline')}</dt>
          <dd><time dateTime={new Date(deadline.dueAt).toISOString()}>{campusTime(deadline.dueAt, language)}</time><br />
            <strong className={deadline.overdue ? 'sla-overdue' : undefined}>{deadline.label}</strong>
          </dd>
        </div>}
      </dl>
      <div className="workflow-actions">
        {DEMO_INCIDENT_TRANSITIONS[incident.status].map(status => (
          <button className={status === 'on_hold' ? "btn" : "btn primary"} type="button" key={status} onClick={() => {
            if (status === 'reported') setDialog(status);
            else {
              updateIncident(incident, { status });
              if (status === 'resolved') onResolved(incident.id);
            }
          }}>{t(actions[status])}</button>
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

function revealAlertDetails(panel) {
  if (!panel) return;
  panel.focus({ preventScroll: true });
  panel.scrollIntoView({ block: 'start', inline: 'nearest', behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
}

export default function Alerts({ section }) {
  const { t } = useDashboardLocale();
  const { incidents } = React.useContext(DemoCtx);
  const [query, setQuery] = React.useState('');
  const directIncident = incidents.find(incident => incident.id === section);
  const [status, setStatus] = React.useState(() => directIncident?.status === 'resolved' ? 'resolved' : 'open');
  const [creating, setCreating] = React.useState(false);
  const details = React.useRef(null);
  const matches = incidents.filter(incident =>
    (status === 'all' || (status === 'open' ? incident.status !== 'resolved' : incident.status === 'resolved')) &&
    [incident.id, incident.title, t(incident.title), incident.checkpoint, incident.room].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  if (status === 'open') matches.sort((a, b) => severities.indexOf(a.severity) - severities.indexOf(b.severity));
  const selected = matches.find(incident => incident.id === section) || matches[0];

  React.useEffect(() => {
    if (!section) return;
    const linked = incidents.find(incident => incident.id === section);
    if (linked) setStatus(current => current === 'all' ? current : linked.status === 'resolved' ? 'resolved' : 'open');
  }, [section]);

  React.useEffect(() => {
    if (section) revealAlertDetails(details.current);
  }, [section]);

  function handleAlertClick(event, id) {
    if (id !== section || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    revealAlertDetails(details.current);
  }

  function showResolvedIncident(id) {
    setStatus(current => current === 'open' ? 'resolved' : current);
    location.hash = '#alerts/' + id;
  }

  return (
    <DashboardPage title={t("Alerts")} className="pg-alerts" actions={<button className="btn primary" type="button" onClick={() => setCreating(true)}>{t("Report alert")}</button>}>
      <div className="workflow-split">
        <section className="card workflow-panel" aria-label={t("Incident list")}>
          <div className="workflow-form">
            <label>{t("Search alerts")}<input type="search" placeholder={t("ID, room or hazard")} value={query} onChange={event => setQuery(event.target.value)} /></label>
            <label>{t("Status")}<select className="alert-status-select" value={status} onChange={event => setStatus(event.target.value)}>
              <option value="open">{t("Open")}</option><option value="resolved">{t("Resolved")}</option><option value="all">{t("All alerts")}</option>
            </select></label>
          </div>
          <div className="workflow-list alert-links">
            {matches.map(incident => (
              <a key={incident.id} className={'item' + (selected?.id === incident.id ? ' on' : '')}
                aria-current={selected?.id === incident.id ? 'true' : undefined} href={'#alerts/' + incident.id}
                onClick={event => handleAlertClick(event, incident.id)}>
                <strong>{t(incident.title)}</strong><span>{incident.id} · {incident.checkpoint}</span>
                <span className="alert-list-meta"><span className="report-severity" data-severity={incident.severity}>{t(incident.severity)}</span>
                  {t(INCIDENT_LABELS[incident.status])}</span>
              </a>
            ))}
            {matches.length === 0 && <p role="status">{t("No alerts match.")}</p>}
          </div>
        </section>
        {selected && <AlertDetails key={selected.id} incident={selected} panel={details} onResolved={showResolvedIncident} />}
      </div>
      {creating && <NewAlert onClose={() => setCreating(false)}
        onCreate={() => { setCreating(false); setQuery(''); setStatus('open'); }} />}
    </DashboardPage>
  );
}
