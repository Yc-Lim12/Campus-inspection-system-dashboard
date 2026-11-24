import React from 'react';
import { useDashboardLocale } from './dashboardLocale.js';
import { DemoCtx } from './ctx.js';
import { WorkflowDialog } from './DashboardPage.jsx';
import { checkpointLabel, reachableCheckpoints, robotDestinationLabel, robotLabels } from './dashboardState.js';

export function RobotSummary({ detailed = false, translate }) {
  const { t } = useDashboardLocale();
  const { robot, configuration } = React.useContext(DemoCtx);
  const label = translate || t;
  return detailed ? robotDestinationLabel(configuration, robot, label) : label(robotLabels[robot.mode]);
}

export default function RobotControls({ className = 'btn', stopClassName = className, onlyRecheck }) {
  const { t } = useDashboardLocale();
  const { configuration, commandRobot, robot } = React.useContext(DemoCtx);
  const checkpoints = reachableCheckpoints(configuration);
  const [command, setCommand] = React.useState(null);
  const [destination, setDestination] = React.useState('');
  const selectedDestination = checkpoints.find(item => item.id === destination)?.id || checkpoints[0]?.id;
  const titles = { send: 'Send robot to a checkpoint', return: 'Return robot to dock', start: 'Start patrol' };
  const dismiss = () => setCommand(null);

  function confirm(event) {
    event.preventDefault();
    const target = onlyRecheck || selectedDestination;
    if (commandRobot(command, target)) dismiss();
  }

  return (
    <>
      {onlyRecheck
        ? <button type="button" className={className} disabled={!checkpoints.some(item => item.id === onlyRecheck)}
            onClick={() => setCommand('send')}>{t("Send robot to recheck")}</button>
        : <>
            <button type="button" className={className} disabled={!checkpoints.length} onClick={() => setCommand('send')}>{t("Send to…")}</button>
            {['stopped', 'docked', 'arrived'].includes(robot.mode) &&
              <button type="button" className={className} disabled={!checkpoints.length} onClick={() => setCommand('start')}>{t("Start patrol")}</button>}
            <button type="button" className={className} disabled={['docked', 'returning'].includes(robot.mode)} onClick={() => setCommand('return')}>{t("Return to dock")}</button>
            <button type="button" className={stopClassName} disabled={['docked', 'stopped'].includes(robot.mode)} onClick={() => commandRobot('stop')}>{t("Stop robot")}</button>
          </>}
      {command && (
        <WorkflowDialog title={t(titles[command])} onClose={dismiss}>
          <form onSubmit={confirm} className="workflow-form">
            <p>{t("Confirm the command for the robot simulator.")}</p>
            {command === 'send' && !onlyRecheck && (
              <label>Checkpoint
                <select value={selectedDestination} onChange={event => setDestination(event.target.value)}>
                  {checkpoints.map(item => <option key={item.id} value={item.id}>{checkpointLabel(checkpoints, item.id)}</option>)}
                </select>
              </label>
            )}
            {onlyRecheck && <p>{checkpointLabel(checkpoints, onlyRecheck)}</p>}
            <div className="workflow-actions">
              <button className="btn primary" type="submit">{t("Confirm")}</button>
              <button className="btn" type="button" onClick={dismiss}>{t("Cancel")}</button>
            </div>
          </form>
        </WorkflowDialog>
      )}
    </>
  );
}
