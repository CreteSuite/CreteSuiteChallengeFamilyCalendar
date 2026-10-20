import { execSync } from 'node:child_process';

// Runs once before the test suite: reseeds the test database.
export default function setup() {
  execSync('tsx server/seed.ts', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: 'postgres://calendar:calendar@localhost:5437/calendar_test',
    },
  });
}
