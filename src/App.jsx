import React from 'react';
import { emptyAssistantHistory, readAssistantHistory, saveAssistantHistory } from './assistantHistory.js';
import { dashboardLanguage, translateDashboard } from './dashboardLocale.js';
import { DEMO_INCIDENT_TRANSITIONS, DemoCtx, ThemeCtx, SearchCtx, RouteCtx } from './ctx.js';
import { campusDate, canRequestPhoto, initialConfiguration, initialRobot, reachableCheckpoints, useStoredState, withConfigurationDefaults } from './dashboardState.js';
import { applyIncidentUpdates } from './incidents.js';
import { applyDisplayPreferences, initialPreferences, playAlertTone } from './preferences.js';
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
  return { route, section };
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
  const [incidentUpdates, setIncidentUpdates] = useStoredState('ci-incident-updates', {});
  const [manualIncidents, setManualIncidents] = useStoredState('ci-manual-incidents', []);
  const [savedPreferences, setPreferences] = useStoredState('ci-preferences', initialPreferences);
  const preferences = React.useMemo(() => ({ ...initialPreferences, ...savedPreferences }), [savedPreferences]);
  const [savedConfiguration, setConfiguration] = useStoredState('ci-configuration', initialConfiguration);
  const configuration = React.useMemo(() => withConfigurationDefaults(savedConfiguration), [savedConfiguration]);
  const [robot, setRobot] = useStoredState('ci-robot-simulator', initialRobot);
  const [lastScheduledPatrol, setLastScheduledPatrol] = useStoredState('ci-scheduled-patrol', null);
  const [photoRequests, setPhotoRequests] = useStoredState('ci-photo-requests', []);
  const [alertAnnouncement, setAlertAnnouncement] = React.useState('');
  const [assistantHistory, setAssistantHistory] = React.useState(() => readAssistantHistory(role));
  const incidents = [...manualIncidents.map(incident => ({ ...incident, ...incidentUpdates[incident.id] })),
    ...applyIncidentUpdates(incidentUpdates)];
  const route = request.route === 'legal' || role ? request.route : 'login';
  const resolvedRoute = route === 'admin' && role !== 'admin' ? 'overview' : route;
  const searchEnabled = Boolean(role) && !NO_SEARCH.has(resolvedRoute);

  React.useEffect(() => {
    saveAssistantHistory(role, assistantHistory);
  }, [role, assistantHistory]);

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
  React.useLayoutEffect(() => {
    applyDisplayPreferences(preferences);
  }, [preferences]);
  React.useEffect(() => {
    if (!['outbound', 'returning'].includes(robot.mode) && !(robot.mode === 'patrol' && robot.updated)) return;
    const timer = window.setTimeout(() => {
      setRobot(current => {
        if (current.updated !== robot.updated || current.mode !== robot.mode || current.destination !== robot.destination) return current;
        const updated = Date.now();
        if (current.mode === 'returning') return { ...current, mode: 'docked', position: null, updated };
        const path = reachableCheckpoints(configuration);
        const index = path.findIndex(item => item.id === current.destination);
        if (index < 0) return { ...current, mode: 'stopped', destination: null, updated };
        const position = path[index].id;
        if (current.mode === 'outbound') return { ...current, mode: 'arrived', position, updated };
        const destination = path[index + 1]?.id;
        return destination ? { mode: 'patrol', position, destination, updated }
          : { mode: 'returning', position, destination: null, updated };
      });
    }, Math.max(0, robot.updated + 5000 - Date.now()));
    return () => window.clearTimeout(timer);
  }, [configuration, robot, setRobot]);
  React.useEffect(() => {
    if (!role || robot.mode !== 'docked') return;
    const path = reachableCheckpoints(configuration);
    if (!path.length) return;

    function checkSchedule() {
      const now = new Date();
      const timeZone = 'Asia/Kuala_Lumpur';
      const day = now.toLocaleDateString('en-GB', { weekday: 'short', timeZone });
      const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone });
      const slot = campusDate(now) + ' ' + time;
      if (lastScheduledPatrol === slot ||
        !configuration.patrols.some(patrol => patrol.active && patrol.days.includes(day) && patrol.time === time)) return;
      setLastScheduledPatrol(slot);
      setRobot(current => current.mode === 'docked'
        ? { ...current, mode: 'patrol', destination: path[0].id, updated: Date.now() } : current);
    }

    checkSchedule();
    const timer = window.setInterval(checkSchedule, 5000);
    return () => window.clearInterval(timer);
  }, [role, robot.mode, configuration, lastScheduledPatrol, setLastScheduledPatrol, setRobot]);
  React.useEffect(() => {
    if (!photoRequests.length) return;
    const maxAge = configuration.retentionHours * 3600000;
    const expires = Math.min(...photoRequests.map(item => item.timestamp + maxAge));
    const timer = window.setTimeout(() => {
      setPhotoRequests(current => current.filter(item => Date.now() - item.timestamp < maxAge));
    }, Math.max(0, expires - Date.now()));
    return () => window.clearTimeout(timer);
  }, [configuration.retentionHours, photoRequests, setPhotoRequests]);
  React.useLayoutEffect(() => {
    const language = dashboardLanguage(preferences.dashboardLanguage);
    document.documentElement.lang = language;
    document.title = translateDashboard(language, meta.titles[resolvedRoute] || 'Campus Inspection');
  }, [resolvedRoute, preferences.dashboardLanguage]);
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
    if (selectedRole !== role) setAssistantHistory(emptyAssistantHistory);
    demoSession.open(selectedRole);
    setRole(selectedRole);
    setRequest({ route: 'loading' });
    location.hash = '#loading';
  }

  function signOut() {
    demoSession.close();
    setRole(null);
    setSearch(false);
    setAlertAnnouncement('');
    setAssistantHistory(emptyAssistantHistory);
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
  function updateIncident(incident, changes) {
    const timestamp = Date.now();
    setIncidentUpdates(current => {
      const previous = { ...incident, ...current[incident.id] };
      if (changes.status && !DEMO_INCIDENT_TRANSITIONS[previous.status].includes(changes.status)) return current;
      const activity = { status: changes.status, assignment: changes.assignment, workOrder: changes.workOrder, note: changes.note };
      const updates = Object.fromEntries(Object.entries(changes).filter(([key, value]) => key !== 'note' && value !== undefined));
      return { ...current, [incident.id]: {
        ...current[incident.id], ...updates, history: [...previous.history, { timestamp, ...activity }],
      } };
    });
  }

  function notifyAlert(incident) {
    if (preferences.severity === 'high' && incident.severity !== 'High') return;
    if (preferences.announce) setAlertAnnouncement(incident);
    if (preferences.sound) void playAlertTone(incident.severity.toLowerCase()).catch(() => {});
  }

  function addIncident(fields) {
    const now = new Date();
    const incident = {
      ...fields, id: 'INC-' + now.getTime().toString(36).toUpperCase(),
      day: campusDate(now),
      detectedAt: now.getTime(),
      time: now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit' }),
      status: 'detected', assignment: 'Unassigned', history: [],
    };
    setManualIncidents(current => [incident, ...current]);
    notifyAlert(incident);
    return incident.id;
  }

  function saveConfiguration(changes, message) {
    if (role !== 'admin') return;
    setConfiguration(current => {
      const config = withConfigurationDefaults(current);
      return {
        ...current, ...(typeof changes === 'function' ? changes(config) : changes),
        changes: [{ timestamp: Date.now(), message }, ...config.changes],
      };
    });
  }

  function commandRobot(command, destination) {
    if (!role) return false;
    const checkpoints = reachableCheckpoints(configuration);
    if (command === 'send' && !checkpoints.some(item => item.id === destination)) return false;
    const next = {
      send: { mode: 'outbound', destination },
      return: { mode: 'returning', destination: null },
      start: { mode: 'patrol', destination: checkpoints[0]?.id },
      stop: { mode: 'stopped', destination: null },
    }[command];
    if (!next || (command === 'start' && !next.destination)) return false;
    setRobot(current => ({ ...current, ...next, updated: Date.now() }));
    return true;
  }

  function takePhoto() {
    if (!canRequestPhoto(configuration, robot)) return;
    const timestamp = Date.now();
    setPhotoRequests(current => [{ timestamp, role, checkpoint: robot.position }, ...current]
      .filter(item => timestamp - item.timestamp < configuration.retentionHours * 3600000));
  }

  const Page = ROUTES[resolvedRoute];
  return (
    <DemoCtx.Provider value={{
      role, signOut, incidents, addIncident, updateIncident, preferences, setPreferences,
      configuration, saveConfiguration, robot, commandRobot, photoRequests, takePhoto, assistantHistory, setAssistantHistory,
    }}>
      <ThemeCtx.Provider value={{ theme, setTheme }}>
        <SearchCtx.Provider value={{ openSearch }}>
          <RouteCtx.Provider value={resolvedRoute}>
            {resolvedRoute === 'login' ? <Login onEnter={enterDemo} /> : <Page key={resolvedRoute} section={request.section} />}
            <Palette open={searchEnabled && search} onClose={() => setSearch(false)} />
            <span className="sr" role="status">{alertAnnouncement && translateDashboard(preferences.dashboardLanguage, 'New {severity} alert: {title}', {
              severity: translateDashboard(preferences.dashboardLanguage, alertAnnouncement.severity),
              title: translateDashboard(preferences.dashboardLanguage, alertAnnouncement.title),
            })}</span>
          </RouteCtx.Provider>
        </SearchCtx.Provider>
      </ThemeCtx.Provider>
    </DemoCtx.Provider>
  );
}
