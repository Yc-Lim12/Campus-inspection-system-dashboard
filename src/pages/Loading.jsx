import React from 'react';
import { useDashboardLocale } from '../dashboardLocale.js';

const STEPS = ['Preparing the demo session', 'Loading the robot and floor map', 'Loading recent sample alerts'];
const STEP_DURATION_MS = 450;
const PROGRESS = [8, 38, 71, 100];

function openDashboard() {
  window.location.replace('#overview');
}

function Step({ label, complete, active }) {
  const state = complete ? ' complete' : active ? ' active' : '';
  return (
    <li className={'startup-step' + state} aria-current={active ? 'step' : undefined}>
      <span className="startup-step-icon" aria-hidden="true">
        {complete && (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 8 3 3 5-6" />
          </svg>
        )}
      </span>
      <span>{label}</span>
    </li>
  );
}

export default function Loading() {
  const { t } = useDashboardLocale();
  const [step, setStep] = React.useState(0);
  const ready = step === STEPS.length;

  React.useEffect(() => {
    const stageTimers = STEPS.map((_, index) => {
      const nextStep = index + 1;
      return window.setTimeout(() => setStep(nextStep), nextStep * STEP_DURATION_MS);
    });
    const navigationTimer = window.setTimeout(openDashboard, STEPS.length * STEP_DURATION_MS + 350);
    return () => {
      stageTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(navigationTimer);
    };
  }, []);

  return (
    <main className="pg pg-loading startup-screen">
      <div className="startup-content">
        <div className="startup-emblem" aria-hidden="true">
          <span className="startup-orbit" />
          <span className="startup-robot">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V5" />
              <circle cx="12" cy="4" r="1" />
              <rect x="5" y="8" width="14" height="10" rx="3" />
              <circle cx="9.5" cy="13" r="1" fill="#a9d4bd" stroke="#a9d4bd" />
              <circle cx="14.5" cy="13" r="1" fill="#a9d4bd" stroke="#a9d4bd" />
            </svg>
          </span>
        </div>

        <div>
          <h1>{t(ready ? 'Dashboard ready' : 'Getting things ready')}</h1>
          <p className="startup-subtitle" role="status">{t(ready ? 'Opening Overview' : 'Preparing the Robot 01 demo')}</p>
        </div>

        <div className="startup-detail">
          <div className="startup-progress" role="progressbar" aria-label={t("Demo startup")} aria-valuenow={PROGRESS[step]}>
            <span style={{ width: PROGRESS[step] + '%' }} />
          </div>
          <ol className="startup-steps">
            {STEPS.map((label, index) => (
              <Step key={label} label={t(label)} complete={index < step} active={index === step} />
            ))}
          </ol>
        </div>

        <button className="startup-skip" type="button" onClick={openDashboard}>{t("Skip and open dashboard")}</button>
      </div>
    </main>
  );
}
