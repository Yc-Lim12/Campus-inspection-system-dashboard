import React from 'react';
import { DEMO_INCIDENT_TRANSITIONS, DemoCtx, ThemeCtx, SearchCtx, RouteCtx } from './ctx.js';
import Palette from './Palette.jsx';
import meta from './meta.json';
import Login from './pages/Login.jsx'; import Loading from './pages/Loading.jsx'; import Overview from './pages/Overview.jsx';
import Camera from './pages/Camera.jsx'; import Alerts from './pages/Alerts.jsx'; import Records from './pages/Records.jsx';
import Reports from './pages/Reports.jsx'; import Assistant from './pages/Assistant.jsx'; import Admin from './pages/Admin.jsx';
import Settings from './pages/Settings.jsx'; import Legal from './pages/Legal.jsx'; import Guidebook from './pages/Guidebook.jsx';

const ROUTES = { login: Login, loading: Loading, overview: Overview, camera: Camera, alerts: Alerts, records: Records, reports: Reports, assistant: Assistant, admin: Admin, settings: Settings, legal: Legal, guidebook: Guidebook };
const NO_SEARCH = new Set(['login', 'loading']);
const readLocation = () => {
  const [name, section] = location.hash.slice(1).split('/');
  const route = Object.prototype.hasOwnProperty.call(ROUTES, name) ? name : 'login';
  return { route, section: route === 'legal' ? section : undefined };
};
const store = {
  get: () => { try { return localStorage.getItem('ci-theme'); } catch { return null; } },
  set: (v) => { try { localStorage.setItem('ci-theme', v); } catch {} },
};
const demoSession = {
  readRole: () => {
    try {
      const role = sessionStorage.getItem('ci-demo-role');
      if (role === 'staff' || role === 'admin') return role;
      return sessionStorage.getItem('ci-demo-open') === 'true' ? 'staff' : null;
    } catch { return null; }
  },
  open: (role) => { try { sessionStorage.setItem('ci-demo-role', role); } catch {} },
  close: () => {
    try {
      sessionStorage.removeItem('ci-demo-role');
      sessionStorage.removeItem('ci-demo-open');
    } catch {}
  },
};

function applyTheme(t) {
  const el = document.documentElement;
  if (t === 'auto') el.removeAttribute('data-theme'); else el.setAttribute('data-theme', t);
}

export default function App() {
  const [role, setRole] = React.useState(demoSession.readRole);
  const [request, setRequest] = React.useState(readLocation);
  const [theme, setThemeState] = React.useState(() => store.get() || 'light');
  const [search, setSearch] = React.useState(false);
  const [incidentStatuses, setIncidentStatuses] = React.useState({});
  const route = request.route === 'legal' || role ? request.route : 'login';
  const resolvedRoute = route === 'admin' && role !== 'admin' ? 'overview' : route;
  const searchEnabled = Boolean(role) && !NO_SEARCH.has(resolvedRoute);

  React.useEffect(() => {
    function onHashChange() {
      if (location.hash === '#main') {
        history.replaceState(null, '', '#' + resolvedRoute + (request.section ? '/' + request.section : ''));
        document.getElementById('main')?.focus({ preventScroll: true });
        return;
      }
      const next = readLocation();
      setRequest(next);
      setSearch(false);
      if (!next.section) window.scrollTo(0, 0);
    }
    addEventListener('hashchange', onHashChange);
    return () => removeEventListener('hashchange', onHashChange);
  }, [resolvedRoute, request.section]);
  React.useEffect(() => {
    if (resolvedRoute === request.route && (location.hash || resolvedRoute !== 'login')) return;
    history.replaceState(null, '', '#' + resolvedRoute);
    if (resolvedRoute !== request.route) setRequest({ route: resolvedRoute });
  }, [request, resolvedRoute]);
  React.useLayoutEffect(() => {
    document.documentElement.dataset.demoRole = role || 'guest';
  }, [role]);
  React.useEffect(() => { applyTheme(theme); }, [theme]);
  React.useEffect(() => { document.title = meta.titles[resolvedRoute] || 'Campus Inspection'; }, [resolvedRoute]);
  React.useEffect(() => {
    if (!searchEnabled) return;
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearch((s) => !s);
      } else if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
        e.preventDefault();
        setSearch(true);
      }
    }
    addEventListener('keydown', onKeyDown);
    return () => removeEventListener('keydown', onKeyDown);
  }, [searchEnabled]);

  function enterDemo(selectedRole) {
    demoSession.open(selectedRole);
    setRole(selectedRole);
    setRequest({ route: 'loading' });
    location.hash = '#loading';
  }

  function signOut() {
    demoSession.close();
    setRole(null);
    setSearch(false);
    setIncidentStatuses({});
    setRequest({ route: 'login' });
    history.replaceState(null, '', '#login');
    window.scrollTo(0, 0);
  }

  const setTheme = (t) => { store.set(t); setThemeState(t); };
  const openSearch = (e) => {
    if (!searchEnabled) return;
    e?.target?.blur?.();
    setSearch(true);
  };
  const setIncidentStatus = (id, status) => {
    setIncidentStatuses((current) => {
      const previous = current[id] || 'detected';
      if (!DEMO_INCIDENT_TRANSITIONS[previous].includes(status)) return current;
      return { ...current, [id]: status };
    });
  };

  const Page = ROUTES[resolvedRoute];
  return (
    <DemoCtx.Provider value={{ role, signOut, incidentStatuses, setIncidentStatus }}>
      <ThemeCtx.Provider value={{ theme, setTheme }}>
        <SearchCtx.Provider value={{ openSearch }}>
          <RouteCtx.Provider value={resolvedRoute}>
            {resolvedRoute === 'login' ? <Login onEnter={enterDemo} /> : <Page key={resolvedRoute} section={request.section} />}
            <Palette open={searchEnabled && search} onClose={() => setSearch(false)} />
          </RouteCtx.Provider>
        </SearchCtx.Provider>
      </ThemeCtx.Provider>
    </DemoCtx.Provider>
  );
}
