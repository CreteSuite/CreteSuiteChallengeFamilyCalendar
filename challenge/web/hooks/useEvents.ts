import { useEffect, useState } from 'react';
import type { CalendarEvent, EventInput } from '../../shared/types';
import { api } from '../api';

export function useEvents(userId: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listEvents(userId)
      .then(setEvents)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

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

  return { events, loading, error, createEvent, updateEvent, deleteEvent };
}
