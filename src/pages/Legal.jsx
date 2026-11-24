import React from 'react';
import { DemoCtx } from '../ctx.js';
import Sidebar from '../Sidebar.jsx';
import { policySections } from './legalPolicies.js';

function PolicyCopy({ content, onNavigate }) {
  return (
    <div className="policy-copy">
      <p className="policy-demo-note"><strong>Demo.</strong> {content.demo}</p>
      {content.blocks.map(({ title, text, items, link }) => (
        <div className="policy-block" key={title || link[0]}>
          {title && <h3>{title}</h3>}
          {text && <p>{text}</p>}
          {items && (
            <ul>
              {items.map(item => Array.isArray(item) ? (
                <li key={item[0]}><strong>{item[0]}.</strong> {item[1]}</li>
              ) : <li key={item}>{item}</li>)}
            </ul>
          )}
          {link && (
            <p className="policy-reference">
              <a href={link[1]} onClick={link[1].startsWith("#legal/") ? (event) => onNavigate(event, link[1].slice(7)) : undefined}>
                {link[0]}
              </a>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function openPolicy(id, shouldAnimate) {
  const heading = document.getElementById('legal-' + id);
  if (!heading) return;

  const animate = shouldAnimate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  heading.focus({ preventScroll: true });
  heading.scrollIntoView({ block: 'start', behavior: animate ? 'smooth' : 'instant' });
  if (!animate) return;

  let slide;
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    window.clearTimeout(timeout);
    slide = heading.closest('section').animate([
      { transform: 'translateX(-12px)' },
      { transform: 'translateX(0)' },
    ], { duration: 280, easing: 'ease-out' });
  }, { rootMargin: '0px 0px -25% 0px' });
  const timeout = window.setTimeout(() => observer.disconnect(), 1000);
  observer.observe(heading);

  return () => {
    observer.disconnect();
    window.clearTimeout(timeout);
    slide?.cancel();
  };
}

export default function Legal({ section }) {
  const { role } = React.useContext(DemoCtx);
  const clickedPolicy = React.useRef(null);
  const cancelMotion = React.useRef(null);
  const current = policySections.some(({ id }) => id === section) ? section : policySections[0].id;

  React.useEffect(() => {
    const animate = clickedPolicy.current === section;
    clickedPolicy.current = null;
    if (section && section === current) cancelMotion.current = openPolicy(section, animate);
    return () => cancelMotion.current?.();
  }, [current, section]);

  function handlePolicyClick(event, id) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (section === id) {
      event.preventDefault();
      cancelMotion.current?.();
      cancelMotion.current = openPolicy(id, true);
    } else {
      clickedPolicy.current = id;
    }
  }

  return (
    <div className="pg pg-legal">
      <div className="demo-legal-layout">
        <a className="skip" href="#main">Skip to main content</a>
        {role && <Sidebar />}
        <div className="content">
          <main id="main" tabIndex={-1} className="demo-legal-main">
            <header className="policy-header">
              <a className="policy-back" href={role ? "#overview" : "#login"}>
                <span aria-hidden="true">←</span> {role ? "Back to Overview" : "Back to demo entry"}
              </a>
              <h1>Privacy and legal</h1>
              <p>Privacy, camera use, AI, and robot safety for the demo and proposed campus deployment.</p>
            </header>
            <div className="policy-layout">
              <nav aria-labelledby="policy-nav-title" className="demo-policy-nav">
                <h2 id="policy-nav-title">On this page</h2>
                <ul>
                  {policySections.map(({ id, title }) => (
                    <li key={id}>
                      <a href={"#legal/" + id} aria-current={current === id ? "location" : undefined} onClick={(event) => handlePolicyClick(event, id)}>
                        {title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="policy-sections">
                {policySections.map(({ id, title, titleMs, en, ms }) => (
                  <section key={id} aria-labelledby={"legal-" + id} className="demo-policy-section">
                    <h2 id={"legal-" + id} tabIndex={-1}>{title}</h2>
                    <PolicyCopy content={en} onNavigate={handlePolicyClick} />
                    <details className="policy-translation" lang="ms">
                      <summary><span className="policy-language">Bahasa Melayu</span><span>{titleMs}</span></summary>
                      <PolicyCopy content={ms} onNavigate={handlePolicyClick} />
                    </details>
                  </section>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
