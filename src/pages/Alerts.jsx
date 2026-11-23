import React from 'react';
import { SidebarProfile } from '../Sidebar.jsx';
import { SearchCtx } from '../ctx.js';

const ALERTS = [
  { id: 'INC-0231', title: 'Water leak or stain', checkpoint: 'CP1 · UW-8-5', time: '10:12', badge: 'High', tone: 'high' },
  { id: 'INC-0230', title: 'PM2.5 above limit', checkpoint: 'CP2 · UC-8-8', time: '10:31', badge: 'Medium', tone: 'med', pm25: 41 },
  { id: 'INC-0228', title: 'Floor obstruction', checkpoint: 'CP4 · UC-8-11', time: 'Yesterday', badge: 'Medium', tone: 'med' },
  { id: 'INC-0224', title: 'Water leak or stain', checkpoint: 'CP1 · UW-8-5', time: 'Wed', badge: 'Resolved', tone: 'resolved', resolution: '6.2 h' },
  { id: 'INC-0221', title: 'Floor obstruction', checkpoint: 'CP2 · UC-8-8', time: 'Tue', badge: 'Resolved', tone: 'resolved', resolution: '0.7 h' },
  { id: 'INC-0219', title: 'PM2.5 above limit', checkpoint: 'CP2 · UC-8-8', time: 'Mon', badge: 'Resolved', tone: 'resolved', resolution: '11 h' },
  { id: 'INC-0217', title: 'Floor obstruction', checkpoint: 'CP4 · UC-8-11', time: 'Sun', badge: 'Resolved', tone: 'resolved', resolution: '1.4 h' },
];

function AlertBadge({ alert }) {
  return <span className={'pill ' + alert.tone}>{alert.badge}</span>;
}

function AlertList({ selected, onSelect }) {
  return (
    <div className="alert-list" role="group" aria-label="Incident list">
      {ALERTS.map((alert, index) => (
        <React.Fragment key={alert.id}>
          {index === 3 && <p className="muted alert-list-heading">Earlier this week</p>}
          <button
            type="button"
            className={'item' + (selected.id === alert.id ? ' on' : '')}
            aria-pressed={selected.id === alert.id}
            aria-controls="alert-details"
            onClick={(event) => onSelect(alert, event.currentTarget)}
          >
            <span className="row"><AlertBadge alert={alert} /><span className="muted">{alert.id} · {alert.time}</span></span>
            <strong>{alert.title}</strong>
            <span className="muted">{alert.checkpoint}{alert.resolution && ' · fixed in ' + alert.resolution}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

function AlertSummary({ alert }) {
  return (
    <>
      <div className="row">
        <div>
          <span className="muted">{alert.id}</span>
          <h2 className="h" id="active-alert-title">{alert.title}</h2>
          <span className="muted">{alert.checkpoint}</span>
        </div>
        <AlertBadge alert={alert} />
      </div>
      {alert.pm25 && (
        <div className="alert-reading">
          <span>Checkpoint PM₂.₅</span>
          <strong>{alert.pm25} <small>µg/m³</small></strong>
        </div>
      )}
      <dl className="alert-summary">
        <div><dt>Checkpoint</dt><dd>{alert.checkpoint}</dd></div>
        <div><dt>Detected</dt><dd>{alert.time}</dd></div>
        {alert.resolution && <div><dt>Time to resolution</dt><dd>{alert.resolution}</dd></div>}
      </dl>
      <div><a href="#records" className="btn">Past records</a></div>
    </>
  );
}

export default function Alerts() {
  const { openSearch } = React.useContext(SearchCtx);
  const [selected, setSelected] = React.useState(ALERTS[0]);
  const panel = React.useRef(null);

  function selectAlert(alert, button) {
    setSelected(alert);
    const detail = panel.current;
    if (detail && detail.getBoundingClientRect().top > button.getBoundingClientRect().bottom) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      detail.focus({ preventScroll: true });
      detail.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  return (<div className="pg pg-alerts">
<div style={{"minHeight": "100vh", "margin": "0 auto", "display": "flex", "flexWrap": "wrap"}}>{" "}<a href="#main" className="skip">{"Skip to main content"}</a>{" "}<aside className="side" aria-label="Sidebar">{" "}<div className="brand"><span className="appicon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="8" width="14" height="10" rx="3"></rect><path d="M12 8V5"></path><circle cx="12" cy="4" r="1"></circle><circle cx="9.5" cy="13" r="1" fill="#8CC4F0" stroke="#8CC4F0"></circle><circle cx="14.5" cy="13" r="1" fill="#8CC4F0" stroke="#8CC4F0"></circle></svg></span><div><strong>{"Campus Inspection"}</strong><span>{"Sunway Univ · Level 8"}</span></div></div>{" "}<label className="sq"><span className="sr">{"Search everything"}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg><input id="gq" type="search" placeholder="Search…" onFocus={openSearch} readOnly /><kbd>{"⌘K"}</kbd></label>{" "}<a href="#camera" className="robot"><span className="dot" aria-hidden="true"></span><span><strong>{"Patrolling"}</strong><span>{"CP3 next · Battery 78%"}</span></span></a>{" "}<nav aria-label="Main" className="sn">{" "}<a href="#overview" className="si"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"></path></svg><span>{"Overview"}</span></a>{" "}<a href="#camera" className="si"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="6" width="13" height="12" rx="2"></rect><path d="m16 10 5-3v10l-5-3"></path></svg><span>{"Camera"}</span></a>{" "}<a href="#alerts" className="si on" aria-current="page"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 2 20h20L12 3Z"></path><path d="M12 10v4"></path><path d="M12 17h.01"></path></svg><span>{"Alerts"}</span><span className="badge" aria-label="2 open">{"2"}</span></a>{" "}<a href="#records" className="si"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"></rect><path d="M8 8h8M8 12h8M8 16h5"></path></svg><span>{"Records"}</span></a>{" "}<a href="#reports" className="si"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"></path></svg><span>{"Reports"}</span></a>{" "}<a href="#assistant" className="si"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"></path><path d="M8 10h8"></path></svg><span>{"Assistant"}</span></a>{" "}<p className="sec">{"Manage"}</p>{" "}<a href="#admin" className="si"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"></circle><path d="M5 20c1-4 4-6 7-6s6 2 7 6"></path></svg><span>{"Admin"}</span></a>{" "}<a href="#settings" className="si"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"></path></svg><span>{"Settings"}</span></a>{" "}<a href="#guidebook" className="si"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7"></path><path d="M12 17h.01"></path></svg><span>{"Guidebook"}</span></a>{" "}</nav>{" "}<SidebarProfile />{" "}</aside>{" "}<div className="content">{" "}<main id="main" style={{"padding": "28px 32px 40px", "display": "flex", "flexDirection": "column", "gap": "20px"}}>{" "}<h1 style={{"margin": "0", "fontSize": "34px", "fontWeight": "700", "letterSpacing": "-.025em"}}>{"Alerts"}</h1>{" "}<div style={{"display": "flex", "flexWrap": "wrap", "gap": "20px", "alignItems": "flex-start"}}>{" "}<section className="card" style={{"flex": "1 1 280px", "padding": "12px", "gap": "4px"}}>{" "}<label className="srch" style={{"margin": "2px 2px 8px"}}><span className="sr">{"Search alerts"}</span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg><input id="aq" type="search" placeholder="Search by ID, room or type" onFocus={openSearch} readOnly /></label>{" "}
  <AlertList selected={selected} onSelect={selectAlert} />
</section>{" "}<section className="card alert-detail" id="alert-details" aria-labelledby="active-alert-title" tabIndex={-1} ref={panel}>
  <div key={selected.id} className="alert-detail-content">
    {selected === ALERTS[0] ? <>
{" "}<div className="row"><div><span className="muted" style={{"fontWeight": "600"}}>{"INC-0231"}</span><h2 className="h" id="active-alert-title">{"Water leak or stain"}</h2><span className="muted">{"CP1 · UW-8-5"}</span></div><div style={{"display": "flex", "flexDirection": "column", "alignItems": "flex-end", "gap": "6px"}}><span className="pill high">{"High"}</span><span style={{"fontSize": "12px", "fontWeight": "600", "color": "var(--c8A4500)"}}>{"Due by 14:12 · 3 h 30 min left"}</span></div></div>{" "}<ol aria-label="Incident progress" style={{"listStyle": "none", "margin": "0", "padding": "0", "display": "flex", "gap": "6px", "fontSize": "12px", "fontWeight": "600"}}><li style={{"flex": "1", "display": "flex", "flexDirection": "column", "gap": "6px", "color": "var(--c1D1D1F)"}}><i style={{"display": "block", "height": "6px", "borderRadius": "999px", "background": "var(--c4A7FD4)"}}></i>{"Detected 10:12"}</li><li aria-current="step" style={{"flex": "1", "display": "flex", "flexDirection": "column", "gap": "6px", "color": "var(--c1E5AA8)"}}><i style={{"display": "block", "height": "6px", "borderRadius": "999px", "background": "linear-gradient(90deg,var(--c4A7FD4) 50%,var(--cE6E9EF) 50%)"}}></i>{"Acknowledge"}</li><li style={{"flex": "1", "display": "flex", "flexDirection": "column", "gap": "6px", "color": "var(--c86868B)"}}><i style={{"display": "block", "height": "6px", "borderRadius": "999px", "background": "var(--cE6E9EF)"}}></i>{"Report to FM"}</li><li style={{"flex": "1", "display": "flex", "flexDirection": "column", "gap": "6px", "color": "var(--c86868B)"}}><i style={{"display": "block", "height": "6px", "borderRadius": "999px", "background": "var(--cE6E9EF)"}}></i>{"Resolved"}</li></ol>{" "}<div role="img" aria-label="Checkpoint photo with a box around the detected water leak, confidence 0.86" style={{"height": "290px", "position": "relative", "background": "var(--cF2F2F7)", "borderRadius": "14px", "display": "flex", "alignItems": "center", "justifyContent": "center", "color": "var(--c6E6E73)", "fontSize": "13px"}}>{" "}<span>{"Checkpoint photo from Pi camera"}</span>{" "}<div style={{"position": "absolute", "left": "38%", "top": "30%", "width": "26%", "height": "38%", "border": "3px solid var(--cD0574F)", "borderRadius": "6px"}}></div>{" "}<span style={{"position": "absolute", "left": "38%", "top": "calc(30% - 26px)", "background": "var(--cD0574F)", "color": "var(--cFFFFFF)", "fontSize": "12px", "fontWeight": "600", "padding": "3px 8px", "borderRadius": "6px"}}>{"water_leak 0.86"}</span>{" "}</div>{" "}<div style={{"display": "grid", "gridTemplateColumns": "repeat(2, minmax(0, 1fr))", "gap": "12px 32px"}}>{" "}<div className="row"><span className="muted">{"Hazard class"}</span><span>{"Water leak or stain"}</span></div>{" "}<div className="row"><span className="muted">{"Confidence"}</span><span>{"0.86"}</span></div>{" "}<div className="row"><span className="muted">{"Detected"}</span><span>{"20 Nov 2026, 10:12"}</span></div>{" "}<div className="row"><span className="muted">{"Humidity"}</span><span>{"71%"}</span></div>{" "}<div className="row"><span className="muted">{"Assigned to"}</span><span>{"Facilities Management"}</span></div>{" "}<div className="row"><span className="muted">{"Response target"}</span><span>{"4 h (High)"}</span></div>{" "}</div>{" "}<div style={{"display": "flex", "flexWrap": "wrap", "gap": "8px", "paddingTop": "6px"}}>{" "}<button className="btn primary" type="button">{"Acknowledge"}</button>{" "}<button className="btn" type="button">{"Report to FM"}</button>{" "}<button className="btn" type="button">{"Send robot to recheck"}</button>{" "}<a href="#records" className="btn">{"Past records"}</a>{" "}</div>{" "}<div style={{"borderTop": "1px solid rgba(0,0,0,.08)", "paddingTop": "14px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(240px, 1fr))", "gap": "18px"}}>{" "}<div><h3 style={{"margin": "0 0 8px", "fontSize": "14px", "fontWeight": "600"}}>{"Activity"}</h3>{" "}<ol style={{"listStyle": "none", "margin": "0", "padding": "0", "display": "flex", "flexDirection": "column", "gap": "8px", "fontSize": "13px"}}><li style={{"display": "flex", "gap": "10px"}}><span className="muted" style={{"width": "42px", "fontVariantNumeric": "tabular-nums"}}>{"10:12"}</span><span>{"Detected by "}<strong>{"Robot 01"}</strong>{" at CP1, confidence 0.86"}</span></li><li style={{"display": "flex", "gap": "10px"}}><span className="muted" style={{"width": "42px", "fontVariantNumeric": "tabular-nums"}}>{"10:12"}</span><span>{"Alert sent to Facility staff (2 people)"}</span></li><li style={{"display": "flex", "gap": "10px"}}><span className="muted" style={{"width": "42px", "fontVariantNumeric": "tabular-nums"}}>{"10:20"}</span><span>{"Viewed by "}<strong>{"[ Staff name ]"}</strong></span></li><li style={{"display": "flex", "gap": "10px", "color": "var(--c6E6E73)"}}><span style={{"width": "42px"}}>{"next"}</span><span>{"Robot rechecks CP1 on the 14:00 patrol"}</span></li></ol></div>{" "}<div><h3 style={{"margin": "0 0 8px", "fontSize": "14px", "fontWeight": "600"}}>{"This spot before"}</h3>{" "}<div style={{"display": "flex", "gap": "8px"}}>{" "}<div style={{"flex": "1"}}><div role="img" aria-label="Earlier photo, Wednesday, water stain" style={{"aspectRatio": "4 / 3", "borderRadius": "10px", "background": "linear-gradient(160deg,var(--cD8DEE6),var(--cB9C2CE))", "position": "relative"}}><span style={{"position": "absolute", "inset": "30% 30%", "border": "2px solid var(--cFF9F0A)", "borderRadius": "4px"}}></span></div><span className="muted" style={{"fontSize": "12px"}}>{"Wed · leak, fixed"}</span></div>{" "}<div style={{"flex": "1"}}><div role="img" aria-label="Earlier photo, Monday, clear floor" style={{"aspectRatio": "4 / 3", "borderRadius": "10px", "background": "linear-gradient(160deg,var(--cE2E6EC),var(--cC9D0DA))"}}></div><span className="muted" style={{"fontSize": "12px"}}>{"Mon · clear"}</span></div>{" "}<div style={{"flex": "1"}}><div role="img" aria-label="Earlier photo, last Friday, clear floor" style={{"aspectRatio": "4 / 3", "borderRadius": "10px", "background": "linear-gradient(160deg,var(--cE2E6EC),var(--cC9D0DA))"}}></div><span className="muted" style={{"fontSize": "12px"}}>{"Last Fri · clear"}</span></div>{" "}</div>{" "}<p className="muted" style={{"margin": "8px 0 0", "fontSize": "12px"}}>{"2nd leak at CP1 this week. Consider a pipe or ceiling check."}</p></div>{" "}</div>{" "}
    </> : <AlertSummary alert={selected} />}
  </div>
</section>{" "}</div>{" "}</main>{" "}<footer style={{"marginTop": "auto", "padding": "18px 32px 26px", "display": "flex", "flexWrap": "wrap", "justifyContent": "space-between", "gap": "8px 20px", "fontSize": "12px", "color": "var(--c6E6E73)", "borderTop": "1px solid rgba(0,0,0,.08)"}}><span>{"© 2026 Campus Inspection Robot · IT Project, Sunway College"}</span><nav aria-label="Legal" style={{"display": "flex", "flexWrap": "wrap", "gap": "16px"}}><a href="#legal" style={{"color": "var(--c3A3A3C)"}}>{"Privacy Notice"}</a><a href="#legal" style={{"color": "var(--c3A3A3C)"}}>{"Terms of Use"}</a><a href="#legal" style={{"color": "var(--c3A3A3C)"}}>{"Camera and Image Policy"}</a><a href="#legal" style={{"color": "var(--c3A3A3C)"}}>{"Accessibility"}</a></nav></footer>{" "}</div>{" "}</div>
</div>);
}
