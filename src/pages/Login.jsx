import React from 'react';
import RoverSchematic from '../RoverSchematic.jsx';

export default function Login({ onEnter }) {
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
            <p className="login-product">Campus Inspection Robot</p>
          </div>
          <RoverSchematic />
        </div>
        <section className="login-content" aria-labelledby="login-heading">
          <h1 id="login-heading">Open demo</h1>
          <p className="login-intro">Choose a sample role to preview the dashboard.</p>
          <form className="login-form" onSubmit={submitDemo} autoComplete="off" aria-describedby="demo-login-note">
            <p id="demo-login-note" className="login-intro">Email and password are optional demo fields. Use sample values only.</p>
            <label className="demo-login-field">Email<input type="text" inputMode="email" autoComplete="off" placeholder="name@example.com" /></label>
            <label className="demo-login-field">Password<input type="password" autoComplete="new-password" placeholder="Optional" /></label>
            <fieldset className="demo-role-picker">
              <legend>Demo role</legend>
              <label><input type="radio" name="demo-role" value="staff" checked={role === 'staff'} onChange={() => setRole('staff')} /> Facility staff</label>
              <label><input type="radio" name="demo-role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} /> Administrator</label>
            </fieldset>
            <button type="submit" className="btn login-submit">
              Open dashboard
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12h14m-6-6 6 6-6 6" />
              </svg>
            </button>
          </form>
          <p className="login-policies"><a href="#legal/terms">Terms of Use</a><a href="#legal/privacy">Privacy Notice</a></p>
        </section>
      </div>
    </main>
  );
}
