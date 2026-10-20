export type User = {
  id: string;
  name: string;
};

export type Group = {
  id: string;
  name: string;
  color: string;
};

export type CalendarEvent = {
  id: number;
  title: string;
  startsAt: string;
  endsAt: string;
  groupId: string;
  notes: string | null;
  createdBy: string;
  createdAt: string;
};

export type EventInput = {
  title: string;
  startsAt: string;
  endsAt: string;
  groupId: string;
  notes: string | null;
};

export type Me = {
  user: User;
  groups: Group[];
  recentGroupId: string | null;
};
