# Family Calendar

A tiny shared calendar for a family. Everyone in a group sees that group's events.

- **Users:** Mom, Dad, Son and Coach Rivera.
- **Groups:** *Family* (Mom, Dad, Son) and *Soccer team* (Son, Coach Rivera). A user can be in several groups.
- **Events:** title, start, end, group and optional notes. Create one with **+ New event**; click an event to edit or delete it.

There is no login. The current user comes from the URL (`?user=mom`), and the **Viewing as** switcher in the header just changes that param.

## Requirements

- Node 22+
- pnpm 10+
- Docker (for Postgres)

## Running it

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts Postgres in Docker (host port **5437**), creates and seeds the database on the first run, then starts:

- the API on http://localhost:3001
- the web app on http://localhost:5173 (Vite proxies `/api` to the API)

Other scripts:

| Command          | What it does                                               |
| ---------------- | ---------------------------------------------------------- |
| `pnpm db:reset`  | Drops all tables and reseeds. Seed dates are relative to the current week. |
| `pnpm db:down`   | Stops the Postgres container (data is kept in a Docker volume). |
| `pnpm test`      | Runs Vitest against a separate `calendar_test` database.   |
| `pnpm typecheck` | Type-checks server and web.                                |

To connect with `psql` or another client: `postgres://calendar:calendar@localhost:5437/calendar`.

## Two people side by side

Each browser window can be a different person because the user lives in the URL:

- Window 1: http://localhost:5173/?user=mom
- Window 2: http://localhost:5173/?user=son

`?user=dad` and `?user=coach` work too.

## Structure

```
challenge/
├── docker-compose.yml        Postgres 17
├── shared/
│   ├── types.ts              Types shared by server and web
│   └── dates.ts              Week/date helpers
├── server/                   Express API
│   ├── index.ts              Routes and request validation
│   ├── db.ts                 Connection pool and schema
│   ├── events.repository.ts  Event queries, and every event write (create/update/delete)
│   ├── users.repository.ts   Users and groups (read-only)
│   └── seed.ts               Reset + seed script
└── web/                      React app (Vite)
    ├── App.tsx               Page layout, week navigation, modal state
    ├── api.ts                fetch wrappers for the API
    ├── hooks/
    │   ├── useCurrentUser.ts Current user (from the URL), their groups, all users
    │   └── useEvents.ts      Loads events and exposes create/update/delete
    ├── components/
    │   ├── Header.tsx        Title, your groups, user switcher
    │   ├── WeekView.tsx      7-day grid
    │   ├── EventBlock.tsx    One event in the grid
    │   └── EventModal.tsx    Create/edit form
    └── styles.css
```

## API

All endpoints take the acting user as `?user=<id>`.

| Method | Path              | Description                                   |
| ------ | ----------------- | --------------------------------------------- |
| GET    | `/api/users`      | All users (for the switcher)                  |
| GET    | `/api/me`         | The current user and their groups             |
| GET    | `/api/events`     | Events from every group the user belongs to   |
| POST   | `/api/events`     | Create an event in one of the user's groups   |
| PATCH  | `/api/events/:id` | Update an event                               |
| DELETE | `/api/events/:id` | Delete an event                               |

## Tests

Vitest is set up with a couple of tests (`shared/dates.test.ts`, `server/events.repository.test.ts`). Add a `*.test.ts` file anywhere and `pnpm test` picks it up. Repository tests hit the `calendar_test` database, which is reseeded before each run.
