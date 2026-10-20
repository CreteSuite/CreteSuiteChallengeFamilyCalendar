import pg from 'pg';

// Return timestamps as ISO strings instead of Date objects.
const TIMESTAMPTZ_OID = 1184;
pg.types.setTypeParser(TIMESTAMPTZ_OID, (value) => new Date(value).toISOString());

export const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ?? 'postgres://calendar:calendar@localhost:5437/calendar',
});

export async function createSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id   text PRIMARY KEY,
      name text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS groups (
      id    text PRIMARY KEY,
      name  text NOT NULL,
      color text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS group_members (
      group_id text NOT NULL REFERENCES groups (id),
      user_id  text NOT NULL REFERENCES users (id),
      PRIMARY KEY (group_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS events (
      id         serial PRIMARY KEY,
      title      text NOT NULL,
      starts_at  timestamptz NOT NULL,
      ends_at    timestamptz NOT NULL,
      group_id   text NOT NULL REFERENCES groups (id),
      notes      text,
      created_by text NOT NULL REFERENCES users (id),
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

export async function dropSchema() {
  await pool.query('DROP TABLE IF EXISTS events, group_members, groups, users');
}
