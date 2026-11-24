import React from 'react';
import { useDashboardLocale } from '../dashboardLocale.js';
import DashboardPage, { WorkflowDialog } from '../DashboardPage.jsx';
import { DemoCtx } from '../ctx.js';
import { campusTime, robotLabels } from '../dashboardState.js';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const limitFields = [
  ['temperatureMin', 'Minimum temperature (°C)', -20, 80],
  ['temperatureMax', 'Maximum temperature (°C)', -20, 80],
  ['humidityMin', 'Minimum humidity (%)', 0, 100],
  ['humidityMax', 'Maximum humidity (%)', 0, 100],
  ['pm25', 'Maximum PM2.5 (µg/m³)', 0, 1000],
  ['gas', 'Gas above baseline (%)', 0, 1000],
];

function changeMessage(message, t) {
  if (!message) return '';
  if (typeof message !== 'string') {
    const values = Object.fromEntries(Object.entries(message.values).map(([key, value]) => [key, t(value)]));
    return t(message.key, values);
  }
  const patterns = [
    [/^Updated patrol (.+)$/, 'Updated patrol {item}', 'item'],
    [/^Added patrol (.+)$/, 'Added patrol {item}', 'item'],
    [/^Updated zone (.+)$/, 'Updated zone {item}', 'item'],
    [/^Added zone (.+)$/, 'Added zone {item}', 'item'],
    [/^Added (.+) to the local roster$/, 'Added {email} to the local roster', 'email'],
    [/^Set photo request retention to (\d+) hours$/, 'Set photo request retention to {hours} hours', 'hours'],
    [/^Updated (.+)$/, 'Updated {item}', 'item'],
    [/^Added (.+)$/, 'Added {item}', 'item'],
  ];
  for (const [pattern, key, field] of patterns) {
    const match = message.match(pattern);
    if (match) return t(key, { [field]: t(match[1]) });
  }
  return t(message);
}

function Editor({ type, item, configuration, save, onClose }) {
  const { t } = useDashboardLocale();
  const [error, setError] = React.useState('');
  const titles = {
    checkpoint: item ? 'Edit checkpoint' : 'Add checkpoint',
    patrol: item ? 'Edit patrol' : 'Add patrol',
    person: 'Invite to local roster',
    zone: item ? 'Edit restricted zone' : 'Add restricted zone',
    retention: 'Change photo request retention',
  };

  function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = key => String(data.get(key) || '').trim();
    let update;
    let message;
    if (type === 'checkpoint') {
      const room = get('room').toUpperCase();
      if (!room || !get('location')) return setError('Enter a room and location.');
      if (configuration.checkpoints.some(entry => entry.room === room && entry.id !== item?.id)) return setError('That room already has a checkpoint.');
      const id = item?.id || 'CP' + (Math.max(0, ...configuration.checkpoints.map(entry => Number(entry.id.slice(2)))) + 1);
      const entry = { id, room, location: get('location'), active: data.has('active'), photo: data.has('photo') };
      update = { checkpoints: item ? configuration.checkpoints.map(checkpoint => checkpoint.id === id ? entry : checkpoint) : [...configuration.checkpoints, entry] };
      message = { key: item ? 'Updated {item}' : 'Added {item}', values: { item: id + ' · ' + room } };
    }
    if (type === 'patrol') {
      const selectedDays = data.getAll('days');
      if (!get('name') || !selectedDays.length) return setError('Enter a name and choose at least one day.');
      const duplicate = configuration.patrols.some(patrol => patrol.id !== item?.id && patrol.active && data.has('active') &&
        patrol.time === get('time') && patrol.days.some(day => selectedDays.includes(day)));
      if (duplicate) return setError('An active patrol already starts at that time on one of these days.');
      const entry = { id: item?.id || Date.now(), name: get('name'), time: get('time'), days: selectedDays, active: data.has('active') };
      update = { patrols: item ? configuration.patrols.map(patrol => patrol.id === entry.id ? entry : patrol) : [...configuration.patrols, entry] };
      message = { key: item ? 'Updated patrol {item}' : 'Added patrol {item}', values: { item: entry.name } };
    }
    if (type === 'person') {
      const email = get('email').toLowerCase();
      if (configuration.people.some(person => person.email === email)) return setError('That email is already on the local roster.');
      update = { people: [...configuration.people, { email, role: get('role') }] };
      message = { key: 'Added {email} to the local roster', values: { email } };
    }
    if (type === 'zone') {
      if (!get('name')) return setError('Enter a name for the zone.');
      const entry = { id: item?.id || Date.now(), name: get('name'), rule: get('rule'), checkpoint: get('checkpoint') };
      update = { zones: item ? configuration.zones.map(zone => zone.id === entry.id ? entry : zone) : [...configuration.zones, entry] };
      message = { key: item ? 'Updated zone {item}' : 'Added zone {item}', values: { item: entry.name } };
    }
    if (type === 'retention') {
      update = { retentionHours: Number(get('hours')) };
      message = { key: 'Set photo request retention to {hours} hours', values: { hours: update.retentionHours } };
    }
    save(update, message);
    onClose();
  }

  return (
    <WorkflowDialog title={t(titles[type])} onClose={onClose}>
      <form className="workflow-form" onSubmit={submit} onChange={() => setError('')}>
        {type === 'checkpoint' && <>
          <label>{t("Room")}<input name="room" required maxLength={40} defaultValue={item?.room} /></label>
          <label>{t("Location description")}<input name="location" required maxLength={100} defaultValue={item?.location} /></label>
          <label className="workflow-check"><input name="active" type="checkbox" defaultChecked={item?.active ?? true} />{" " + t("Active checkpoint")}</label>
          <label className="workflow-check"><input name="photo" type="checkbox" defaultChecked={item?.photo ?? true} />{" " + t("Allow photo requests")}</label>
        </>}
        {type === 'patrol' && <>
          <label>{t("Name")}<input name="name" required maxLength={60} defaultValue={item?.name} /></label>
          <label>{t("Start time")}<input name="time" type="time" required defaultValue={item?.time} /></label>
          <fieldset className="workflow-actions"><legend>{t("Days")}</legend>{days.map(day => (
            <label key={day} className="workflow-check"><input type="checkbox" name="days" value={day} defaultChecked={item?.days.includes(day) ?? false} /> {t(day)}</label>
          ))}</fieldset>
          <label className="workflow-check"><input name="active" type="checkbox" defaultChecked={item?.active ?? true} />{" " + t("Active patrol")}</label>
        </>}
        {type === 'person' && <>
          <p>{t("Local roster entries can be assigned to alerts. Invitations are recorded here.")}</p>
          <label>{t("Email")}<input name="email" type="email" required maxLength={120} /></label>
          <label>{t("Role")}<select name="role"><option value="Facility staff">{t("Facility staff")}</option><option value="Administrator">{t("Administrator")}</option></select></label>
        </>}
        {type === 'zone' && <>
          <label>{t("Zone name")}<input name="name" required maxLength={70} defaultValue={item?.name} /></label>
          <label>{t("Checkpoint")}<select name="checkpoint" defaultValue={item?.checkpoint || ''}>
            <option value="">{t("Area listed by name")}</option>
            {configuration.checkpoints.map(point => <option value={point.id} key={point.id}>{point.id} · {point.room}</option>)}
          </select></label>
          <label>{t("Rule")}<select name="rule" defaultValue={item?.rule || 'No photography'}><option value="No photography">{t("No photography")}</option><option value="No entry">{t("No entry")}</option></select></label>
        </>}
        {type === 'retention' && <label>{t("Retention in hours")}<input name="hours" type="number" required min="1" max="168" defaultValue={configuration.retentionHours} /></label>}
        {error && <p role="alert">{t(error)}</p>}
        <div className="workflow-actions">
          <button className="btn primary" type="submit">{t("Save")}</button>
          <button className="btn" type="button" onClick={onClose}>{t("Cancel")}</button>
        </div>
      </form>
    </WorkflowDialog>
  );
}

export default function Admin() {
  const { language, t } = useDashboardLocale();
  const { configuration, saveConfiguration, robot } = React.useContext(DemoCtx);
  const [editor, setEditor] = React.useState(null);
  const [limits, setLimits] = React.useState(configuration.limits);
  const [feedback, setFeedback] = React.useState('');
  const [error, setError] = React.useState('');
  const close = () => setEditor(null);
  const open = (type, item) => setEditor({ type, item });

  function save(update, message) {
    saveConfiguration(update, message);
    setFeedback(message);
  }

  function saveLimits(event) {
    event.preventDefault();
    const next = Object.fromEntries(limitFields.map(([key]) => [key, Number(limits[key])]));
    if (next.temperatureMin > next.temperatureMax || next.humidityMin > next.humidityMax) {
      setError('Minimum values must be less than or equal to their maximums.');
      return;
    }
    setError('');
    save({ limits: next }, 'Saved reading limits');
  }

  return (
    <DashboardPage title={t("Admin")} className="pg-admin" description={t("Manage the local inspection configuration and robot simulator.")}
      actions={<button className="btn" type="button" onClick={() => open('log')}>{t("View change log")}</button>}>
      <p className="workflow-feedback" role="status">{changeMessage(feedback, t)}</p>
      <div className="workflow-grid">
        <section className="card workflow-panel" aria-labelledby="checkpoints-admin">
          <div className="workflow-heading"><h2 id="checkpoints-admin">{t("Checkpoints")}</h2>
            <button className="btn primary" type="button" onClick={() => open('checkpoint')}>{t("Add checkpoint")}</button></div>
          <ul className="workflow-list">
            {configuration.checkpoints.map(item => <li key={item.id} className="workflow-row">
              <div><strong>{item.id} · {item.room}</strong><br /><span className="muted">{t(item.location)} · {t(item.active ? 'Active' : 'Inactive')} · {t(item.photo ? 'Photos allowed' : 'No photos')}</span></div>
              <button className="btn" type="button" aria-label={t('Edit checkpoint') + ' ' + item.id} onClick={() => open('checkpoint', item)}>{t("Edit")}</button>
            </li>)}
          </ul>
        </section>
        <section className="card workflow-panel" aria-labelledby="robot-health">
          <h2 id="robot-health">{t("Robot 01 health")}</h2>
          <p>{configuration.healthCheckedAt ? t('Last check {time}', { time: campusTime(configuration.healthCheckedAt, language) }) : t('No simulator health check run yet.')}</p>
          <p className="muted">{configuration.healthCheckedAt && t('Simulator responding. Robot mode: {mode}.', { mode: t(robotLabels[robot.mode]) })}</p>
          <button className="btn" type="button" onClick={() => save({ healthCheckedAt: Date.now() }, 'Simulator health check passed')}>{t("Run health check")}</button>
        </section>
        <section className="card workflow-panel" aria-labelledby="alert-limits">
          <h2 id="alert-limits">{t("Alert limits")}</h2>
          <p className="muted">{t("Saved temperature, humidity and PM2.5 limits apply to the air quality report. The gas limit is stored for use with sensor data.")}</p>
          <form className="workflow-form" onSubmit={saveLimits}>
            <div className="workflow-fields">
              {limitFields.map(([key, label, min, max]) => <label key={key}>{t(label)}
                <input type="number" required min={min} max={max} step="0.1" value={limits[key]}
                  onChange={event => { setLimits(current => ({ ...current, [key]: event.target.value })); setError(''); }} />
              </label>)}
            </div>
            {error && <p role="alert">{t(error)}</p>}
            <button className="btn primary" type="submit">{t("Save limits")}</button>
          </form>
        </section>
        <section className="card workflow-panel" aria-labelledby="people-admin">
          <div className="workflow-heading"><h2 id="people-admin">{t("People")}</h2>
            <button className="btn" type="button" onClick={() => open('person')}>{t("Invite")}</button></div>
          {configuration.people.length ? <ul className="workflow-list">{configuration.people.map(person =>
            <li key={person.email}>{person.email} · {t(person.role)}</li>)}</ul> : <p className="muted">{t("No local roster entries.")}</p>}
        </section>
        <section className="card workflow-panel" aria-labelledby="patrols-admin">
          <div className="workflow-heading"><h2 id="patrols-admin">{t("Patrol schedule")}</h2>
            <button className="btn primary" type="button" onClick={() => open('patrol')}>{t("Add patrol")}</button></div>
          <p className="muted">{t("Uses campus time. A scheduled patrol starts when the dashboard is open and the simulator is docked.")}</p>
          <ul className="workflow-list">{[...configuration.patrols].sort((left, right) => left.time.localeCompare(right.time)).map(item =>
            <li className="workflow-row" key={item.id}><div><strong>{item.time} · {t(item.name)}</strong><br />
              <span className="muted">{item.days.map(day => t(day)).join(', ')} · {t(item.active ? 'Active' : 'Paused')}</span></div>
              <button className="btn" type="button" aria-label={t('Edit patrol') + ' ' + t(item.name)} onClick={() => open('patrol', item)}>{t("Edit")}</button>
            </li>)}</ul>
        </section>
        <section className="card workflow-panel" aria-labelledby="privacy-admin">
          <div className="workflow-heading"><h2 id="privacy-admin">{t("Camera and access rules")}</h2>
            <button className="btn" type="button" onClick={() => open('zone')}>{t("Add restricted zone")}</button></div>
          <ul className="workflow-list">{configuration.zones.map(item => <li key={item.id} className="workflow-row">
            <span>{t(item.name)} · {t(item.rule)}{item.checkpoint && ' · ' + item.checkpoint}</span>
            <button className="btn" type="button" aria-label={t('Edit restricted zone') + ' ' + t(item.name)} onClick={() => open('zone', item)}>{t("Edit")}</button>
          </li>)}</ul>
          <div className="workflow-row"><span>{t('Photo request history · {hours} hours', { hours: configuration.retentionHours })}</span>
            <button className="btn" type="button" onClick={() => open('retention')}>{t("Change retention")}</button></div>
        </section>
      </div>
      {editor?.type === 'log' && <WorkflowDialog title={t("Change log")} onClose={close}>
        {configuration.changes.length ? <ol className="workflow-list">{configuration.changes.map((change, index) =>
          <li key={index}>{campusTime(change.timestamp, language)} · {changeMessage(change.message, t)}</li>)}</ol> : <p>{t("No changes recorded.")}</p>}
        <button className="btn" type="button" onClick={close}>{t("Close")}</button>
      </WorkflowDialog>}
      {editor && editor.type !== 'log' && <Editor {...editor} configuration={configuration} save={save} onClose={close} />}
    </DashboardPage>
  );
}
