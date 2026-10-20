import { useState } from 'react';
import { addDays, isSameDay, startOfWeek } from '../shared/dates';
import type { CalendarEvent, EventInput } from '../shared/types';
import { EventModal } from './components/EventModal';
import { Header } from './components/Header';
import { WeekView } from './components/WeekView';
import { useCurrentUser } from './hooks/useCurrentUser';
import { useEvents } from './hooks/useEvents';

type Editing = { mode: 'create' } | { mode: 'edit'; event: CalendarEvent } | null;

function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const format = (date: Date) => date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${format(weekStart)} – ${format(weekEnd)}, ${weekEnd.getFullYear()}`;
}

export function App() {
  const { userId, me, users, error } = useCurrentUser();
  const { events, loading, error: eventsError, ...actions } = useEvents(userId);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [editing, setEditing] = useState<Editing>(null);

  if (error) return <p className="page-message">Could not load calendar: {error}</p>;
  if (!me) return <p className="page-message">Loading…</p>;

  const today = new Date();
  const isCurrentWeek = isSameDay(weekStart, startOfWeek(today));

  async function handleSave(input: EventInput) {
    if (editing?.mode === 'edit') {
      await actions.updateEvent(editing.event.id, input);
    } else {
      await actions.createEvent(input);
    }
    setEditing(null);
  }

  async function handleDelete() {
    if (editing?.mode !== 'edit') return;
    await actions.deleteEvent(editing.event.id);
    setEditing(null);
  }

  return (
    <div className="app">
      <Header me={me} users={users} />

      <div className="toolbar">
        <div className="week-nav">
          <button onClick={() => setWeekStart(addDays(weekStart, -7))} aria-label="Previous week">
            ‹
          </button>
          <button onClick={() => setWeekStart(startOfWeek(today))} disabled={isCurrentWeek}>
            Today
          </button>
          <button onClick={() => setWeekStart(addDays(weekStart, 7))} aria-label="Next week">
            ›
          </button>
          <h2>{formatWeekRange(weekStart)}</h2>
        </div>
        <button className="primary" onClick={() => setEditing({ mode: 'create' })}>
          + New event
        </button>
      </div>

      {eventsError && <p className="error">Could not load events: {eventsError}</p>}
      {loading ? (
        <p className="page-message">Loading events…</p>
      ) : (
        <WeekView
          weekStart={weekStart}
          events={events}
          groups={me.groups}
          onSelect={(event) => setEditing({ mode: 'edit', event })}
        />
      )}

      {editing && (
        <EventModal
          event={editing.mode === 'edit' ? editing.event : null}
          me={me}
          users={users}
          initialDate={isCurrentWeek ? today : weekStart}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
