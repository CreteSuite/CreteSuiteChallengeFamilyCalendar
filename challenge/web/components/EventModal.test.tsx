import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { CalendarEvent, Group, Me } from '../../shared/types';
import { EventModal } from './EventModal';

const dad = { id: 'dad', name: 'Dad' };
const mom = { id: 'mom', name: 'Mom' };
const son = { id: 'son', name: 'Son' };
const coach = { id: 'coach', name: 'Coach Rivera' };

const family: Group = { id: 'family', name: 'Family', color: '#2563eb', members: [dad, mom, son] };
const soccer: Group = { id: 'soccer', name: 'Soccer team', color: '#16a34a', members: [coach, son] };

const sonMe: Me = { user: son, groups: [family, soccer], recentGroupId: 'soccer' };

const scienceFair: CalendarEvent = {
  id: 1,
  title: 'Science fair',
  startsAt: '2026-01-15T19:00:00.000Z',
  endsAt: '2026-01-15T20:00:00.000Z',
  groupId: 'family',
  notes: null,
  createdBy: 'son',
  createdAt: '2026-01-11T10:00:00.000Z',
};

function render(event: CalendarEvent | null, me: Me = sonMe): string {
  return renderToStaticMarkup(
    <EventModal
      event={event}
      me={me}
      users={[coach, dad, mom, son]}
      initialDate={new Date(2026, 0, 15)}
      onSave={async () => {}}
      onDelete={async () => {}}
      onClose={() => {}}
    />,
  );
}

// Visible text only: drops tags and the comments React puts between text nodes.
function textOf(markup: string): string {
  return markup.replace(/<[^>]*>/g, '');
}

describe('EventModal visibility indicator', () => {
  it('shows who will see a new event in the preselected group', () => {
    expect(textOf(render(null))).toContain('Visible to: You · Coach Rivera');
  });

  it("shows who will see an existing event in the event's group", () => {
    expect(textOf(render(scienceFair))).toContain('Visible to: You · Dad · Mom');
  });

  it('says "only you" for a group with no other members', () => {
    const solo: Group = { id: 'solo', name: 'Just me', color: '#9333ea', members: [son] };
    const me: Me = { user: son, groups: [solo], recentGroupId: null };

    expect(textOf(render(null, me))).toContain('Visible to: only you');
  });

  it('sits right below the group field', () => {
    const text = textOf(render(null));

    expect(text.indexOf('Group')).toBeLessThan(text.indexOf('Visible to'));
    expect(text.indexOf('Visible to')).toBeLessThan(text.indexOf('Notes'));
  });

  it("uses the group's color", () => {
    expect(render(null)).toContain(soccer.color);
  });
});
