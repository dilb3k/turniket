import { memo, useMemo, useState } from 'react';

function UsersDirectory({ users }) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = users.filter((user) => {
      if (!q) {
        return true;
      }

      const hay = `${user.name} ${user.class} ${user.rollNumber}`.toLowerCase();
      return hay.includes(q);
    });

    const getSortValue = (item) => {
      if (sortBy === 'recent') {
        return item.lastPassedAt ? new Date(item.lastPassedAt).getTime() : 0;
      }

      if (sortBy === 'roll') {
        return String(item.rollNumber || '');
      }

      return String(item.name || '').toLowerCase();
    };

    return list.sort((a, b) => {
      const av = getSortValue(a);
      const bv = getSortValue(b);

      if (sortBy === 'recent') {
        return Number(bv) - Number(av);
      }

      return String(av).localeCompare(String(bv));
    });
  }, [query, sortBy, users]);

  return (
    <section className="panel">
      <div className="panel-header">
        <h3>User Directory</h3>
        <div className="directory-controls">
          <input
            className="input"
            placeholder="Qidiruv: ism, sinf, roll..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select className="input" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="name">Saralash: Ism</option>
            <option value="roll">Saralash: Roll</option>
            <option value="recent">Saralash: Oxirgi kirish</option>
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Ism</th>
              <th>Sinf</th>
              <th>Roll</th>
              <th>Oxirgi kirish</th>
              <th>Jami kirish</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-empty">
                  User topilmadi.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.class}</td>
                  <td>{user.rollNumber}</td>
                  <td>{user.lastPassedAt ? new Date(user.lastPassedAt).toLocaleString() : '-'}</td>
                  <td>{Array.isArray(user.passHistory) ? user.passHistory.length : 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default memo(UsersDirectory);
