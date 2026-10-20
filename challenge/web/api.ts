import type { CalendarEvent, EventInput, Me, User } from '../shared/types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const asUser = (userId: string) => `user=${encodeURIComponent(userId)}`;

export const api = {
  listUsers: () => request<User[]>('/api/users'),

  getMe: (userId: string) => request<Me>(`/api/me?${asUser(userId)}`),

  listEvents: (userId: string) => request<CalendarEvent[]>(`/api/events?${asUser(userId)}`),

  createEvent: (userId: string, input: EventInput) =>
    request<CalendarEvent>(`/api/events?${asUser(userId)}`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateEvent: (userId: string, id: number, input: EventInput) =>
    request<CalendarEvent>(`/api/events/${id}?${asUser(userId)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  deleteEvent: (userId: string, id: number) =>
    request<void>(`/api/events/${id}?${asUser(userId)}`, { method: 'DELETE' }),
};
