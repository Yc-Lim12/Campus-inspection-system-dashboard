import React from 'react';
import RoverSchematic from '../RoverSchematic.jsx';

export default function Login({ onEnter }) {
  const [showPassword, setShowPassword] = React.useState(false);

  function submitDemo(event) {
    event.preventDefault();
    onEnter();
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
          <h1 id="login-heading">Log in</h1>
          <p className="login-intro">Email and password are optional in this demo.</p>

          <form className="login-form" onSubmit={submitDemo} noValidate>
            <label className="field" htmlFor="login-email">
              Sunway email
              <input id="login-email" type="email" autoComplete="off" placeholder="name@sunway.edu.my" />
            </label>

            <div className="field">
              <label htmlFor="login-password">Password</label>
              <div className="login-password">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Enter a sample password"
                />
                <button
                  type="button"
                  aria-controls="login-password"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((shown) => !shown)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn login-submit">
              Log in
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </button>
          </form>

          <p className="login-policies"><a href="#legal">Terms of Use</a><a href="#legal">Privacy Notice</a></p>
        </section>
      </div>
    </main>
  );
}
