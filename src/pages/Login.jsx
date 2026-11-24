import React from 'react';
import { dashboardLanguages, useDashboardLocale } from '../dashboardLocale.js';
import { DemoCtx } from '../ctx.js';
import RoverSchematic from '../RoverSchematic.jsx';

export default function Login({ onEnter }) {
  const { language, t } = useDashboardLocale();
  const { setPreferences } = React.useContext(DemoCtx);
  const [role, setRole] = React.useState('staff');

  function submitDemo(event) {
    event.preventDefault();
    onEnter(role);
  }

  return (
    <main className="pg pg-login login-screen">
      <div className="login-shell">
        <div className="login-brand">
          <div>
            <p className="login-campus">Sunway University</p>
            <p className="login-product">{t("Campus Inspection Robot")}</p>
          </div>
          <RoverSchematic />
        </div>
        <section className="login-content" aria-labelledby="login-heading">
          <h1 id="login-heading">{t("Open demo")}</h1>
          <p className="login-intro">{t("Choose a sample role to preview the dashboard.")}</p>
          <form className="login-form" onSubmit={submitDemo} autoComplete="off">
            <fieldset className="demo-role-picker">
              <legend>{t("Demo role")}</legend>
              <label><input type="radio" name="demo-role" value="staff" checked={role === 'staff'} onChange={() => setRole('staff')} />{" " + t("Facility staff")}</label>
              <label><input type="radio" name="demo-role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} />{" " + t("Administrator")}</label>
            </fieldset>
            <button type="submit" className="btn login-submit">
              {t("Open dashboard")}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12h14m-6-6 6 6-6 6" />
              </svg>
            </button>
          </form>
          <label className="login-language">{t('Language')}
            <select value={language} onChange={event => {
              const nextLanguage = event.target.value;
              setPreferences(current => ({ ...current, dashboardLanguage: nextLanguage }));
            }}>
              {Object.entries(dashboardLanguages).map(([value, label]) => <option key={value} value={value} lang={value}>{label}</option>)}
            </select>
          </label>
          <p className="login-policies"><a href="#legal/terms">{t("Terms of Use")}</a><a href="#legal/privacy">{t("Privacy Notice")}</a></p>
        </section>
      </div>
    </main>
  );
}
