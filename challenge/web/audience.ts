import type { User } from '../shared/types';

// Who will see an event in a group, from the current user's point of view:
// "You · Coach Rivera", or "only you".
export function describeAudience(members: User[], currentUserId: string): string {
  const others = members.filter((member) => member.id !== currentUserId).map((member) => member.name);
  if (others.length === 0) return 'only you';
  return ['You', ...others].join(' · ');
}
