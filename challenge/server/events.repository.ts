import type { CalendarEvent, EventInput } from '../shared/types';
import { pool } from './db';

const COLUMNS = `
  id,
  title,
  starts_at  AS "startsAt",
  ends_at    AS "endsAt",
  group_id   AS "groupId",
  notes,
  created_by AS "createdBy",
  created_at AS "createdAt"
`;

export async function listEventsForUser(userId: string): Promise<CalendarEvent[]> {
  const { rows } = await pool.query<CalendarEvent>(
    `SELECT ${COLUMNS}
       FROM events
      WHERE group_id IN (SELECT group_id FROM group_members WHERE user_id = $1)
      ORDER BY starts_at`,
    [userId],
  );
  return rows;
}

export async function findEvent(id: number): Promise<CalendarEvent | undefined> {
  const { rows } = await pool.query<CalendarEvent>(
    `SELECT ${COLUMNS} FROM events WHERE id = $1`,
    [id],
  );
  return rows[0];
}

export async function findRecentGroupId(userId: string): Promise<string | null> {
  const { rows } = await pool.query<{ group_id: string }>(
    'SELECT group_id FROM events WHERE created_by = $1 ORDER BY created_at DESC LIMIT 1',
    [userId],
  );
  return rows[0]?.group_id ?? null;
}

export async function createEvent(input: EventInput, createdBy: string): Promise<CalendarEvent> {
  const { rows } = await pool.query<CalendarEvent>(
    `INSERT INTO events (title, starts_at, ends_at, group_id, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUMNS}`,
    [input.title, input.startsAt, input.endsAt, input.groupId, input.notes, createdBy],
  );
  return rows[0];
}

export async function updateEvent(
  id: number,
  input: EventInput,
): Promise<CalendarEvent | undefined> {
  const { rows } = await pool.query<CalendarEvent>(
    `UPDATE events
        SET title = $2, starts_at = $3, ends_at = $4, group_id = $5, notes = $6
      WHERE id = $1
      RETURNING ${COLUMNS}`,
    [id, input.title, input.startsAt, input.endsAt, input.groupId, input.notes],
  );
  return rows[0];
}

export async function deleteEvent(id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM events WHERE id = $1', [id]);
  return rowCount === 1;
}
