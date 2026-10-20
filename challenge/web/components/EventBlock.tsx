import type { CSSProperties } from 'react';
import { formatTime } from '../../shared/dates';
import type { CalendarEvent, Group } from '../../shared/types';

type Props = {
  event: CalendarEvent;
  group: Group | undefined;
  style: CSSProperties;
  onClick: () => void;
};

export function EventBlock({ event, group, style, onClick }: Props) {
  const start = formatTime(new Date(event.startsAt));
  const end = formatTime(new Date(event.endsAt));

  return (
    <button
      className="event-block"
      style={{ ...style, '--group-color': group?.color ?? '#6b7280' } as CSSProperties}
      onClick={onClick}
      title={`${event.title} · ${start}–${end} · ${group?.name ?? ''}`}
    >
      <span className="event-title">{event.title}</span>
      <span className="event-meta">
        {start}–{end} · {group?.name}
      </span>
    </button>
  );
}
