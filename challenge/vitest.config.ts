import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: './server/test-setup.ts',
    env: {
      DATABASE_URL: 'postgres://calendar:calendar@localhost:5437/calendar_test',
    },
  },
});
