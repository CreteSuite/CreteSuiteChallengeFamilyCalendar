import { useEffect, useState } from 'react';
import type { CalendarEvent, EventInput } from '../../shared/types';
import { api } from '../api';
import { startPolling } from '../polling';

export const EVENTS_REFRESH_INTERVAL_MS = 30_000;

export function useEvents(userId: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Keeps polling so changes made by others show up without reloading the page.
  useEffect(
    () =>
      startPolling({
        load: () => api.listEvents(userId),
        intervalMs: EVENTS_REFRESH_INTERVAL_MS,
        onData: (fresh) => {
          setEvents(fresh);
          setLastSyncedAt(new Date());
          setError(null);
          setLoading(false);
        },
        onError: (err) => {
          setError(err.message);
          setLoading(false);
        },
      }),
    [userId],
  );

  async function createEvent(input: EventInput) {
    const created = await api.createEvent(userId, input);
    setEvents((current) => [...current, created]);
  }

  async function updateEvent(id: number, input: EventInput) {
    const updated = await api.updateEvent(userId, id, input);
    setEvents((current) => current.map((event) => (event.id === id ? updated : event)));
  }

  async function deleteEvent(id: number) {
    await api.deleteEvent(userId, id);
    setEvents((current) => current.filter((event) => event.id !== id));
  }

  return { events, loading, error, lastSyncedAt, createEvent, updateEvent, deleteEvent };
}
