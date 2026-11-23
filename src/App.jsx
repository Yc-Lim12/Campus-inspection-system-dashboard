import React from 'react';
import { ThemeCtx, SearchCtx, RouteCtx } from './ctx.js';
import Palette from './Palette.jsx';
import meta from './meta.json';
import Login from './pages/Login.jsx'; import Loading from './pages/Loading.jsx'; import Overview from './pages/Overview.jsx';
import Camera from './pages/Camera.jsx'; import Alerts from './pages/Alerts.jsx'; import Records from './pages/Records.jsx';
import Reports from './pages/Reports.jsx'; import Assistant from './pages/Assistant.jsx'; import Admin from './pages/Admin.jsx';
import Settings from './pages/Settings.jsx'; import Legal from './pages/Legal.jsx'; import Guidebook from './pages/Guidebook.jsx';

const ROUTES = { login: Login, loading: Loading, overview: Overview, camera: Camera, alerts: Alerts, records: Records, reports: Reports, assistant: Assistant, admin: Admin, settings: Settings, legal: Legal, guidebook: Guidebook };
const NO_SEARCH = new Set(['login', 'loading']);
const readHash = () => { const h = location.hash.slice(1); return Object.prototype.hasOwnProperty.call(ROUTES, h) ? h : 'login'; };
const store = { get: () => { try { return localStorage.getItem('ci-theme'); } catch { return null; } }, set: (v) => { try { localStorage.setItem('ci-theme', v); } catch {} } };
const demoSession = {
  isOpen: () => { try { return sessionStorage.getItem('ci-demo-open') === 'true'; } catch { return false; } },
  open: () => { try { sessionStorage.setItem('ci-demo-open', 'true'); } catch {} },
};

function applyTheme(t) {
  const el = document.documentElement;
  if (t === 'auto') el.removeAttribute('data-theme'); else el.setAttribute('data-theme', t);
}

export default function App() {
  const [demoOpen, setDemoOpen] = React.useState(demoSession.isOpen);
  const [requestedRoute, setRequestedRoute] = React.useState(readHash);
  const [theme, setThemeState] = React.useState(() => store.get() || 'light');
  const [search, setSearch] = React.useState(false);
  const route = demoOpen || requestedRoute === 'legal' ? requestedRoute : 'login';

  React.useEffect(() => { const on = () => { setRequestedRoute(readHash()); setSearch(false); window.scrollTo(0, 0); }; addEventListener('hashchange', on); return () => removeEventListener('hashchange', on); }, []);
  React.useEffect(() => {
    if (route === requestedRoute) return;
    history.replaceState(null, '', '#login');
    setRequestedRoute('login');
  }, [requestedRoute, route]);
  React.useEffect(() => { applyTheme(theme); }, [theme]);
  React.useEffect(() => { document.title = (meta.titles[route] || 'Campus Inspection'); }, [route]);
  React.useEffect(() => {
    const on = (e) => {
      if (NO_SEARCH.has(route)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch((s) => !s); }
      else if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); setSearch(true); }
    };
    addEventListener('keydown', on); return () => removeEventListener('keydown', on);
  }, [route]);

  const setTheme = (t) => { store.set(t); setThemeState(t); };
  const openSearch = (e) => { e?.target?.blur?.(); setSearch(true); };
  const enterDemo = () => {
    demoSession.open();
    setDemoOpen(true);
    setRequestedRoute('loading');
    location.hash = '#loading';
  };
  const Page = ROUTES[route];
  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
      <SearchCtx.Provider value={{ openSearch }}>
        <RouteCtx.Provider value={route}>
          {route === 'login' ? <Login onEnter={enterDemo} /> : <Page key={route} />}
          <Palette open={search} onClose={() => setSearch(false)} />
        </RouteCtx.Provider>
      </SearchCtx.Provider>
    </ThemeCtx.Provider>
  );
}
