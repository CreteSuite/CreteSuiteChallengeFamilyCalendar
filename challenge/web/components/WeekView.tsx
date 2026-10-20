import { addDays, formatHour, isSameDay } from '../../shared/dates';
import type { CalendarEvent, Group } from '../../shared/types';
import { EventBlock } from './EventBlock';

const FIRST_HOUR = 7;
const LAST_HOUR = 22;
const HOUR_HEIGHT = 48;

type Props = {
  weekStart: Date;
  events: CalendarEvent[];
  groups: Group[];
  onSelect: (event: CalendarEvent) => void;
};

function minutesFromTop(date: Date): number {
  const minutes = (date.getHours() - FIRST_HOUR) * 60 + date.getMinutes();
  return Math.min(Math.max(minutes, 0), (LAST_HOUR - FIRST_HOUR) * 60);
}

type PlacedEvent = { event: CalendarEvent; column: number; columns: number };

// Overlapping events share the day's width side by side.
// Expects events sorted by start time.
function placeEvents(dayEvents: CalendarEvent[]): PlacedEvent[] {
  const placed: PlacedEvent[] = [];
  let cluster: PlacedEvent[] = [];
  let clusterEnd = '';

  for (const event of dayEvents) {
    if (event.startsAt >= clusterEnd) cluster = [];

    const taken = cluster.filter((p) => p.event.endsAt > event.startsAt).map((p) => p.column);
    let column = 0;
    while (taken.includes(column)) column++;

    const item = { event, column, columns: 1 };
    cluster.push(item);
    placed.push(item);
    if (event.endsAt > clusterEnd) clusterEnd = event.endsAt;

    const columns = Math.max(...cluster.map((p) => p.column)) + 1;
    for (const p of cluster) p.columns = columns;
  }
  return placed;
}

export function WeekView({ weekStart, events, groups, onSelect }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i);
  const today = new Date();

  return (
    <div className="week">
      <div className="week-header">
        <div className="gutter" />
        {days.map((day) => (
          <div key={day.toISOString()} className={isSameDay(day, today) ? 'day-label today' : 'day-label'}>
            <span>{day.toLocaleDateString([], { weekday: 'short' })}</span>
            <strong>{day.getDate()}</strong>
          </div>
        ))}
      </div>

      <div className="week-body">
        <div className="gutter">
          {hours.map((hour) => (
            <div key={hour} className="hour-label" style={{ height: HOUR_HEIGHT }}>
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {days.map((day) => {
          const dayEvents = events
            .filter((event) => isSameDay(new Date(event.startsAt), day))
            .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

          return (
            <div
              key={day.toISOString()}
              className="day-column"
              style={{ height: hours.length * HOUR_HEIGHT, backgroundSize: `100% ${HOUR_HEIGHT}px` }}
            >
              {placeEvents(dayEvents).map(({ event, column, columns }) => {
                const top = minutesFromTop(new Date(event.startsAt));
                const bottom = minutesFromTop(new Date(event.endsAt));

                return (
                  <EventBlock
                    key={event.id}
                    event={event}
                    group={groups.find((group) => group.id === event.groupId)}
                    style={{
                      top: (top / 60) * HOUR_HEIGHT,
                      height: Math.max(((bottom - top) / 60) * HOUR_HEIGHT, 20),
                      left: `calc(${(column / columns) * 100}% + 2px)`,
                      width: `calc(${100 / columns}% - 4px)`,
                    }}
                    onClick={() => onSelect(event)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
