import React from 'react';
import Sidebar from '../Sidebar.jsx';
import AccentPicker from '../AccentPicker.jsx';
import { DemoCtx, ThemeCtx } from '../ctx.js';
import { readPreferences, updatePreference } from '../preferences.js';

const TEXT_SIZES = [['default', 'Default'], ['large', 'Large'], ['larger', 'Larger']];
const APPEARANCES = [['light', 'Light'], ['dark', 'Dark'], ['auto', 'Automatic']];
const ALERT_LEVELS = [['all', 'All alerts'], ['high', 'High only']];

function Options({ id, label, options, value, onChange }) {
  return (
    <div className="li">
      <span id={id}>{label}</span>
      <fieldset className="opts" aria-labelledby={id}>
        {options.map(([key, title]) => (
          <label key={key}>
            <input type="radio" name={id} value={key} checked={value === key} onChange={() => onChange(key)} />
            <span>{title}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="li">
      <span>{label}</span>
      <input className="sw" type="checkbox" role="switch" checked={checked} onChange={event => onChange(event.target.checked)} />
    </label>
  );
}

async function playPreviewTone(severity) {
  const context = new AudioContext();
  try {
    await context.resume();
    const high = severity === 'high';
    const notes = high ? [1040, 1040] : [680, 580];
    const spacing = high ? 0.31 : 0.27;

    notes.forEach((frequency, index) => {
      const tone = context.createOscillator();
      const volume = context.createGain();
      const start = context.currentTime + (high ? 0.015 : 0) + index * spacing;
      tone.type = 'triangle';
      tone.frequency.value = frequency;
      if (high) {
        volume.gain.setValueAtTime(0.001, start);
        volume.gain.linearRampToValueAtTime(0.2, start + 0.008);
        volume.gain.setValueAtTime(0.2, start + 0.20);
        volume.gain.exponentialRampToValueAtTime(0.001, start + 0.24);
      } else {
        volume.gain.setValueAtTime(0.001, start);
        volume.gain.linearRampToValueAtTime(0.14, start + 0.012);
        volume.gain.setValueAtTime(0.14, start + 0.16);
        volume.gain.exponentialRampToValueAtTime(0.001, start + 0.21);
      }
      tone.connect(volume).connect(context.destination);
      if (index === notes.length - 1) tone.onended = () => { void context.close(); };
      tone.start(start);
      tone.stop(start + spacing);
    });
  } catch (error) {
    await context.close();
    throw error;
  }
}

export default function Settings() {
  const { role, signOut } = React.useContext(DemoCtx);
  const { theme, setTheme } = React.useContext(ThemeCtx);
  const [settings, setSettings] = React.useState(readPreferences);
  const [preview, setPreview] = React.useState('');
  const roleLabel = role === 'admin' ? 'Administrator' : 'Facility staff';

  function setOption(key, value) {
    setSettings(updatePreference(key, value));
    setPreview('');
  }

  async function previewAlert(severity) {
    const label = severity === 'high' ? 'High' : 'Medium';
    if (settings.alertLevel === 'high' && severity !== 'high') {
      setPreview('Medium alert filtered out by High only.');
      return;
    }

    const message = label + ' alert preview shown.';
    setPreview(message);
    if (settings.alertSound) {
      try {
        await playPreviewTone(severity);
      } catch {
        setPreview(message + ' Audio is unavailable in this browser.');
      }
    }
  }

  return (
    <div className="pg pg-settings">
      <div className="settings-shell">
        <a className="skip" href="#main">Skip to main content</a>
        <Sidebar />
        <div className="content">
          <main id="main" tabIndex={-1} className="settings-main">
            <h1>Settings</h1>
            <div className="settings-columns">
              <div>
                <h2 className="h" id="a11y">Display and accessibility</h2>
                <section className="card" aria-labelledby="a11y">
                  <Options id="text-size" label="Text size" options={TEXT_SIZES} value={settings.textSize} onChange={value => setOption('textSize', value)} />
                  <Options id="appearance" label="Appearance" options={APPEARANCES} value={theme} onChange={setTheme} />
                  <AccentPicker />
                  <Toggle label="Increase contrast" checked={settings.contrast} onChange={value => setOption('contrast', value)} />
                  <Toggle label="Reduce motion" checked={settings.reduceMotion} onChange={value => setOption('reduceMotion', value)} />
                  <Toggle label="Show checkpoint status labels on map" checked={settings.mapLabels} onChange={value => setOption('mapLabels', value)} />
                  <Toggle label="Announce alert previews to screen readers" checked={settings.announceAlerts} onChange={value => setOption('announceAlerts', value)} />
                </section>
              </div>
              <div className="settings-stack">
                <div>
                  <p id="language-demo" className="demo-feature-note">Language choices are saved for this demo. The dashboard and sample replies keep their existing languages.</p>
                  <h2 className="h" id="lang">Language</h2>
                  <section className="card" aria-labelledby="lang">
                    <label className="li"><span>Dashboard language</span><select value={settings.dashboardLanguage || "en"} onChange={event => setOption("dashboardLanguage", event.target.value)} aria-describedby="language-demo"><option value="en">English</option><option value="ms" lang="ms">Bahasa Melayu</option><option value="zh" lang="zh">中文</option></select></label>
                    <label className="li"><span>AI assistant replies in</span><select value={settings.replyLanguage || "auto"} onChange={event => setOption("replyLanguage", event.target.value)} aria-describedby="language-demo"><option value="auto">Same as my question</option><option value="en">English</option><option value="ms" lang="ms">Bahasa Melayu</option><option value="zh" lang="zh">中文</option></select></label>
                  </section>
                </div>
                <div>
                  <h2 className="h" id="notif">Notification preview</h2>
                  <section className="card" aria-labelledby="notif">
                    <Toggle label="Play a sound for alert previews" checked={settings.alertSound} onChange={value => setOption('alertSound', value)} />
                    <Options id="alert-level" label="Notify me about" options={ALERT_LEVELS} value={settings.alertLevel} onChange={value => setOption('alertLevel', value)} />
                    <div className="li settings-alert-preview">
                      <div className="settings-preview-actions">
                        <button className="btn" type="button" onClick={() => previewAlert('high')}>Preview high alert</button>
                        <button className="btn" type="button" onClick={() => previewAlert('medium')}>Preview medium alert</button>
                      </div>
                      {preview && <p className="muted" aria-hidden={settings.announceAlerts || undefined}>{preview}</p>}
                      <span className="sr" role="status">{settings.announceAlerts ? preview : ''}</span>
                    </div>
                  </section>
                </div>
                <div>
                  <h2 className="h" id="acct">Account</h2>
                  <section className="card" aria-labelledby="acct">
                    <div className="li"><span>Demo session</span><span className="muted">{roleLabel}</span></div>
                    <a className="li settings-policy-link" href="#legal">Privacy, terms and policies <span aria-hidden="true">›</span></a>
                    <div className="li"><span className="muted">No Sunway account is connected.</span><button className="btn" type="button" onClick={signOut}>Sign out</button></div>
                  </section>
                </div>
              </div>
            </div>
          </main>
          <footer className="settings-footer">
            <span>© 2026 Campus Inspection Robot · IT Project, Sunway College</span>
            <nav aria-label="Legal">
              <a href="#legal/privacy">Privacy Notice</a>
              <a href="#legal/terms">Terms of Use</a>
              <a href="#legal/camera">Camera and Image Policy</a>
              <a href="#legal/accessibility">Accessibility</a>
            </nav>
          </footer>
        </div>
      </div>
    </div>
  );
}
