# Campus Inspection Dashboard

Open `index.html` to launch the dashboard, or run `php -S 127.0.0.1:8088` from the project directory and visit `http://127.0.0.1:8088/`. Choose Facility Staff or Administrator to open a demo session.

- Use Alerts to create, assign and resolve incidents, add notes and request rechecks. Records and Reports reflect incident updates and support CSV export.
- Overview, Camera and Alerts share the robot simulator. Confirm commands to send the robot to a checkpoint or return it to dock. Camera saves simulated request history. The incident and sensor readings are examples, including the MQ135 change from baseline and AI-generated water leak evidence. Sample deadlines are shown as of 20 Nov 2026, 10:42 campus time.
- The natural-language query interface answers supported questions from dashboard data in English, Bahasa Melayu and Chinese. Chat history stays in the current tab through page reloads and is cleared at sign-out.
- Administrator can manage checkpoints, default and per-checkpoint limits, response deadlines, a local staff roster, patrol schedules, access rules and photo request retention. Checkpoint access rules affect robot commands and photo requests.

Changes to sample data and preferences persist in the browser. Signing out ends the demo session in the current tab. The demo uses sample readings, an illustrated camera view, local roster entries and a rule-based assistant. Live deployment requires the university account service, physical robot and camera interfaces, and any external AI provider.

Run `npm ci` and `node build.mjs` to rebuild the files in `dist/`.
