// Usage:
//   tsx server/seed.ts             drop everything and reseed
//   tsx server/seed.ts --if-empty  create the schema and seed only if there are no users yet
import { addDays, startOfWeek } from '../shared/dates';
import { createSchema, dropSchema, pool } from './db';

const users = [
  { id: 'mom', name: 'Mom' },
  { id: 'dad', name: 'Dad' },
  { id: 'son', name: 'Son' },
  { id: 'coach', name: 'Coach Rivera' },
];

const groups = [
  { id: 'family', name: 'Family', color: '#2563eb', members: ['mom', 'dad', 'son'] },
  { id: 'soccer', name: 'Soccer team', color: '#16a34a', members: ['son', 'coach'] },
];

// Dates are relative to the current week so the calendar never looks empty.
// day: 0 = Monday ... 6 = Sunday. createdDaysAgo sets created_at.
const events = [
  { title: 'Pilates', day: 1, start: '07:00', end: '08:00', group: 'family', by: 'mom', createdDaysAgo: 6 },
  { title: 'Parent-teacher meeting', day: 2, start: '17:30', end: '18:30', group: 'family', by: 'dad', createdDaysAgo: 5, notes: 'Room 12, Ms. Patel' },
  { title: 'Soccer practice', day: 1, start: '17:00', end: '18:30', group: 'soccer', by: 'coach', createdDaysAgo: 5 },
  { title: 'Soccer practice', day: 3, start: '17:00', end: '18:30', group: 'soccer', by: 'coach', createdDaysAgo: 5 },
  { title: 'Science fair', day: 3, start: '19:00', end: '20:00', group: 'family', by: 'son', createdDaysAgo: 4 },
  { title: 'Grocery run', day: 5, start: '10:00', end: '11:00', group: 'family', by: 'dad', createdDaysAgo: 3 },
  { title: 'Match vs. Eagles', day: 5, start: '14:00', end: '16:00', group: 'soccer', by: 'coach', createdDaysAgo: 3, notes: 'Arrive 30 min early' },
  { title: "Family dinner at Grandma's", day: 6, start: '18:00', end: '20:00', group: 'family', by: 'mom', createdDaysAgo: 2 },
  { title: 'Extra practice with Leo', day: 4, start: '16:00', end: '17:00', group: 'soccer', by: 'son', createdDaysAgo: 1 },
];

function atTime(day: Date, time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(day);
  result.setHours(hours, minutes, 0, 0);
  return result.toISOString();
}

async function seed() {
  const monday = startOfWeek(new Date());

  for (const user of users) {
    await pool.query('INSERT INTO users (id, name) VALUES ($1, $2)', [user.id, user.name]);
  }
  for (const group of groups) {
    await pool.query('INSERT INTO groups (id, name, color) VALUES ($1, $2, $3)', [
      group.id,
      group.name,
      group.color,
    ]);
    for (const userId of group.members) {
      await pool.query('INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)', [
        group.id,
        userId,
      ]);
    }
  }
  for (const [index, event] of events.entries()) {
    const day = addDays(monday, event.day);
    // Offset by index so events created on the same day keep a stable order.
    const createdAt = new Date(Date.now() - event.createdDaysAgo * 86_400_000 + index * 60_000);
    await pool.query(
      `INSERT INTO events (title, starts_at, ends_at, group_id, notes, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        event.title,
        atTime(day, event.start),
        atTime(day, event.end),
        event.group,
        event.notes ?? null,
        event.by,
        createdAt.toISOString(),
      ],
    );
  }
}

async function main() {
  if (process.argv.includes('--if-empty')) {
    await createSchema();
    const { rowCount } = await pool.query('SELECT 1 FROM users LIMIT 1');
    if (rowCount) {
      console.log('Database already seeded (run `pnpm db:reset` to start over)');
      return;
    }
  } else {
    await dropSchema();
    await createSchema();
  }
  await seed();
  console.log(`Seeded ${users.length} users, ${groups.length} groups, ${events.length} events`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
