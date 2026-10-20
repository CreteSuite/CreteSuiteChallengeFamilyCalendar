import type { Me, User } from '../../shared/types';
import { switchUser } from '../hooks/useCurrentUser';

type Props = {
  me: Me;
  users: User[];
};

export function Header({ me, users }: Props) {
  return (
    <header className="header">
      <h1>Family Calendar</h1>

      <div className="header-groups">
        {me.groups.map((group) => (
          <span key={group.id} className="group-chip" style={{ backgroundColor: group.color }}>
            {group.name}
          </span>
        ))}
      </div>

      <label className="user-switcher">
        Viewing as
        <select value={me.user.id} onChange={(e) => switchUser(e.target.value)}>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </label>
    </header>
  );
}
