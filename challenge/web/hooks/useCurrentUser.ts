import { useEffect, useState } from 'react';
import type { Me, User } from '../../shared/types';
import { api } from '../api';

// The current user lives in the URL (`?user=mom`) so each browser window
// can be a different person.
function getUserIdFromUrl(): string {
  return new URLSearchParams(window.location.search).get('user') ?? 'mom';
}

export function switchUser(userId: string) {
  const params = new URLSearchParams(window.location.search);
  params.set('user', userId);
  window.location.search = params.toString();
}

export function useCurrentUser() {
  const [userId] = useState(getUserIdFromUrl);
  const [me, setMe] = useState<Me | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getMe(userId), api.listUsers()])
      .then(([me, users]) => {
        setMe(me);
        setUsers(users);
      })
      .catch((err: Error) => setError(err.message));
  }, [userId]);

  return { userId, me, users, error };
}
