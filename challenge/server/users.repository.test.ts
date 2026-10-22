import { afterAll, describe, expect, it } from 'vitest';
import { pool } from './db';
import { listGroupsForUser } from './users.repository';

afterAll(() => pool.end());

describe('users repository', () => {
  it('lists the members of each group the user belongs to', async () => {
    const groups = await listGroupsForUser('son');

    expect(groups).toEqual([
      expect.objectContaining({
        id: 'family',
        members: [
          { id: 'dad', name: 'Dad' },
          { id: 'mom', name: 'Mom' },
          { id: 'son', name: 'Son' },
        ],
      }),
      expect.objectContaining({
        id: 'soccer',
        members: [
          { id: 'coach', name: 'Coach Rivera' },
          { id: 'son', name: 'Son' },
        ],
      }),
    ]);
  });

  it('does not list groups the user is not a member of', async () => {
    const groups = await listGroupsForUser('coach');

    expect(groups.map((group) => group.id)).toEqual(['soccer']);
  });
});
