import React from 'react';
import Sidebar from './Sidebar.jsx';
import { useDashboardLocale } from './dashboardLocale.js';

export default function DashboardPage({ title, description, actions, children, className = '', lang }) {
  const { language, t } = useDashboardLocale();
  return (
    <div className={'pg workflow-page ' + className} lang={lang || language}>
      <div className="workflow-layout">
        <a href="#main" className="skip" lang={language}>{t('Skip to main content')}</a>
        <Sidebar />
        <div className="content">
          <main id="main" tabIndex={-1} className="workflow-main">
            <header className="workflow-heading">
              <div><h1>{title}</h1>{description && <p className="muted">{description}</p>}</div>
              {actions}
            </header>
            {children}
          </main>
          <footer className="workflow-footer">
            <span>{t("© 2026 Campus Inspection Robot · IT Project, Sunway College")}</span>
            <nav aria-label={t('Legal')} lang={language}>
              <a href="#legal/privacy">{t('Privacy Notice')}</a>
              <a href="#legal/terms">{t('Terms of Use')}</a>
              <a href="#legal/camera">{t('Camera and Image Policy')}</a>
              <a href="#legal/accessibility">{t('Accessibility')}</a>
            </nav>
          </footer>
        </div>
      </div>
    </div>
  );
}

export function WorkflowDialog({ title, onClose, children }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog ref={ref} className="workflow-dialog" aria-labelledby="workflow-dialog-title"
      onCancel={event => { event.preventDefault(); onClose(); }}>
      <h2 id="workflow-dialog-title">{title}</h2>
      {children}
    </dialog>
  );
}
