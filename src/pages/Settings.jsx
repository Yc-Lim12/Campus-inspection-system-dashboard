import React from 'react';
import DashboardPage from '../DashboardPage.jsx';
import AccentPicker from '../AccentPicker.jsx';
import { DemoCtx, ThemeCtx } from '../ctx.js';
import { dashboardLanguages, useDashboardLocale } from '../dashboardLocale.js';
import { playAlertTone } from '../preferences.js';

const copy = {
  'Manage your display, language and alert preferences.': ['Urus tetapan paparan, bahasa dan amaran anda.', '管理显示、语言和警报偏好。'],
  Appearance: ['Paparan', '外观'], Theme: ['Tema', '主题'],
  Light: ['Cerah', '浅色'], Dark: ['Gelap', '深色'], Automatic: ['Automatik', '自动'],
  'Text size': ['Saiz teks', '文字大小'], Default: ['Lalai', '默认'], Large: ['Besar', '大'], Larger: ['Lebih besar', '更大'],
  'Accent colour': ['Warna aksen', '强调色'], 'Increase contrast': ['Tingkatkan kontras', '提高对比度'],
  'Reduce motion': ['Kurangkan animasi', '减少动态效果'], 'Show checkpoint labels on map': ['Papar label titik pemeriksaan pada peta', '在地图上显示检查点标签'],
  Language: ['Bahasa', '语言'], 'Dashboard language': ['Bahasa papan pemuka', '仪表板语言'],
  'Assistant reply language': ['Bahasa jawapan pembantu', '助手回复语言'],
  'Same as my question': ['Sama seperti soalan saya', '与提问语言相同'],
  Notifications: ['Pemberitahuan', '通知'], 'New alert sound': ['Bunyi amaran baharu', '新警报提示音'],
  'Screen reader announcements': ['Pengumuman pembaca skrin', '屏幕阅读器播报'],
  'Notify me about': ['Beritahu saya tentang', '通知范围'], 'All alerts': ['Semua amaran', '所有警报'],
  'High severity only': ['Keparahan tinggi sahaja', '仅高严重程度'],
  'Preview high alert': ['Pratonton amaran tinggi', '预览高级警报'],
  'Preview medium alert': ['Pratonton amaran sederhana', '预览中级警报'],
  'Medium alert filtered out by High only.': ['Amaran sederhana ditapis oleh tetapan keparahan tinggi sahaja.', '仅高严重程度设置已过滤中级警报。'],
  'High alert preview shown.': ['Pratonton amaran tinggi dipaparkan.', '已显示高级警报预览。'],
  'Medium alert preview shown.': ['Pratonton amaran sederhana dipaparkan.', '已显示中级警报预览。'],
  'Preview low alert': ['Pratonton amaran rendah', '预览低级警报'],
  'Low alert preview shown.': ['Pratonton amaran rendah dipaparkan.', '已显示低级警报预览。'],
  'Low alert filtered out by High only.': ['Amaran rendah ditapis oleh tetapan keparahan tinggi sahaja.', '仅高严重程度设置已过滤低级警报。'],
  'Audio is unavailable in this browser.': ['Audio tidak tersedia dalam pelayar ini.', '此浏览器无法播放音频。'],
  Account: ['Akaun', '账户'], 'Privacy, terms and policies': ['Privasi, terma dan dasar', '隐私、条款和政策'],
  'Sign out': ['Log keluar', '退出登录'],
};

function SettingRow({ label, description, children }) {
  return (
    <div className="setting-row setting-select-row">
      <div><label htmlFor={children.props.id}>{label}</label>{description && <p className="muted">{description}</p>}</div>
      <div className="setting-select">{children}</div>
    </div>
  );
}

function Choice({ label, id, value, options, onChange }) {
  return (
    <fieldset className="setting-row setting-choice">
      <legend className="sr">{label}</legend>
      <span aria-hidden="true">{label}</span>
      <div className="dashboard-segments">
        {options.map(([key, text]) => <label key={key}>
          <input type="radio" name={id} checked={value === key} onChange={() => onChange(key)} />
          <span>{text}</span>
        </label>)}
      </div>
    </fieldset>
  );
}

export default function Settings() {
  const { role, signOut, preferences, setPreferences } = React.useContext(DemoCtx);
  const { theme, setTheme } = React.useContext(ThemeCtx);
  const { language, t } = useDashboardLocale(copy);
  const [preview, setPreview] = React.useState([]);
  const previewId = React.useRef(0);

  function set(key, value) {
    setPreferences(current => ({ ...current, [key]: value }));
    previewId.current += 1;
    setPreview([]);
  }

  function toggle(key, label) {
    return (
      <label className="setting-row setting-toggle">
        <span>{t(label)}</span>
        <input className="sw" type="checkbox" role="switch" checked={preferences[key]}
          onChange={event => set(key, event.target.checked)} />
      </label>
    );
  }

  async function previewAlert(severity) {
    const id = ++previewId.current;
    if (preferences.severity === 'high' && severity !== 'high') {
      setPreview([severity === 'low' ? 'Low alert filtered out by High only.' : 'Medium alert filtered out by High only.']);
      return;
    }
    const message = {
      high: 'High alert preview shown.', medium: 'Medium alert preview shown.', low: 'Low alert preview shown.',
    }[severity];
    setPreview([message]);
    if (preferences.sound) {
      try {
        await playAlertTone(severity);
      } catch {
        if (id === previewId.current) setPreview([message, 'Audio is unavailable in this browser.']);
      }
    }
  }

  return (
    <DashboardPage title={t('Settings')} lang={language} className="pg-settings"
      description={t('Manage your display, language and alert preferences.')}>
      <div className="settings-grid">
        <div className="settings-stack">
          <section className="card settings-card" aria-labelledby="display-settings">
            <h2 id="display-settings">{t('Appearance')}</h2>
            <Choice label={t('Theme')} id="appearance" value={theme} onChange={setTheme}
              options={['light', 'dark', 'auto'].map((mode, index) => [mode, t(['Light', 'Dark', 'Automatic'][index])])} />
            <Choice label={t('Text size')} id="text-size" value={preferences.textSize} onChange={value => set('textSize', value)}
              options={['default', 'large', 'larger'].map((size, index) => [size, t(['Default', 'Large', 'Larger'][index])])} />
            <AccentPicker label={t('Accent colour')} />
            {toggle('contrast', 'Increase contrast')}
            {toggle('reducedMotion', 'Reduce motion')}
            {toggle('mapLabels', 'Show checkpoint labels on map')}
          </section>
          <section className="card settings-card settings-account" aria-labelledby="account-settings">
            <h2 id="account-settings">{t('Account')}</h2>
            <div className="setting-row">
              <div><strong>{t(role === 'admin' ? 'Administrator' : 'Facility staff')}</strong><p className="muted">{t('Demo session')}</p></div>
              <div className="workflow-actions">
                <a className="btn" href="#legal">{t('Privacy, terms and policies')}</a>
                <button className="btn" type="button" onClick={signOut}>{t('Sign out')}</button>
              </div>
            </div>
          </section>
        </div>
        <div className="settings-stack">
          <section className="card settings-card" aria-labelledby="language-settings">
            <h2 id="language-settings">{t('Language')}</h2>
            <SettingRow label={t('Dashboard language')}>
              <select id="dashboard-language" value={preferences.dashboardLanguage} onChange={event => set('dashboardLanguage', event.target.value)}>
                {Object.entries(dashboardLanguages).map(([value, label]) => <option key={value} value={value} lang={value}>{label}</option>)}
              </select>
            </SettingRow>
            <SettingRow label={t('Assistant reply language')}>
              <select id="reply-language" value={preferences.assistantLanguage} onChange={event => set('assistantLanguage', event.target.value)}>
                <option value="auto">{t('Same as my question')}</option>
                {Object.entries(dashboardLanguages).map(([value, label]) => <option key={value} value={value} lang={value}>{label}</option>)}
              </select>
            </SettingRow>
          </section>
          <section className="card settings-card" aria-labelledby="notification-settings">
            <h2 id="notification-settings">{t('Notifications')}</h2>
            {toggle('sound', 'New alert sound')}
            {toggle('announce', 'Screen reader announcements')}
            <SettingRow label={t('Notify me about')}>
              <select id="notification-severity" value={preferences.severity} onChange={event => set('severity', event.target.value)}>
                <option value="all">{t('All alerts')}</option><option value="high">{t('High severity only')}</option>
              </select>
            </SettingRow>
            <div className="settings-preview">
              <div className="workflow-actions">
                <button className="btn" type="button" onClick={() => previewAlert('high')}>{t('Preview high alert')}</button>
                <button className="btn" type="button" onClick={() => previewAlert('medium')}>{t('Preview medium alert')}</button>
                <button className="btn" type="button" onClick={() => previewAlert('low')}>{t('Preview low alert')}</button>
              </div>
              <p className="muted" aria-hidden={preferences.announce || undefined}>{preview.map(t).join(' ')}</p>
              <span className="sr" role="status">{preferences.announce ? preview.map(t).join(' ') : ''}</span>
            </div>
          </section>
        </div>
      </div>
    </DashboardPage>
  );
}
