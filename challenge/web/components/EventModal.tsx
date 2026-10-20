import { useEffect, useState, type FormEvent } from 'react';
import { fromInputValues, toDateInputValue, toTimeInputValue } from '../../shared/dates';
import type { CalendarEvent, EventInput, Me, User } from '../../shared/types';

type Props = {
  event: CalendarEvent | null;
  me: Me;
  users: User[];
  initialDate: Date;
  onSave: (input: EventInput) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
};

function nextFullHour(day: Date): Date {
  const now = new Date();
  const result = new Date(day);
  result.setHours(Math.min(now.getHours() + 1, 21), 0, 0, 0);
  return result;
}

export function EventModal({ event, me, users, initialDate, onSave, onDelete, onClose }: Props) {
  const start = event ? new Date(event.startsAt) : nextFullHour(initialDate);
  const end = event ? new Date(event.endsAt) : new Date(start.getTime() + 60 * 60 * 1000);

  const [title, setTitle] = useState(event?.title ?? '');
  const [date, setDate] = useState(toDateInputValue(start));
  const [startTime, setStartTime] = useState(toTimeInputValue(start));
  const [endTime, setEndTime] = useState(toTimeInputValue(end));
  const [groupId, setGroupId] = useState(
    event?.groupId ?? me.recentGroupId ?? me.groups[0]?.id ?? '',
  );
  const [notes, setNotes] = useState(event?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  async function run(action: () => Promise<void>) {
    setSaving(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const startsAt = fromInputValues(date, startTime);
    const endsAt = fromInputValues(date, endTime);
    if (endsAt <= startsAt) {
      setError('End time must be after start time');
      return;
    }
    run(() =>
      onSave({
        title,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        groupId,
        notes: notes || null,
      }),
    );
  }

  const author = event && users.find((user) => user.id === event.createdBy);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal" onSubmit={handleSubmit} onMouseDown={(e) => e.stopPropagation()}>
        <h2>{event ? 'Edit event' : 'New event'}</h2>

        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </label>

        <div className="row">
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label>
            Start
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </label>
          <label>
            End
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </label>
        </div>

        <label>
          Group
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            {me.groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </label>

        {author && <p className="muted">Added by {author.name}</p>}
        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          {event && (
            <button type="button" className="danger" onClick={() => run(onDelete)} disabled={saving}>
              Delete
            </button>
          )}
          <span className="spacer" />
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
