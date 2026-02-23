import { memo } from 'react';

function TopUsers({ users }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Eng Faol Userlar</h3>
      </div>

      <ul className="top-users">
        {users.length === 0 ? (
          <li className="top-users-empty">Hozircha ma'lumot yo'q.</li>
        ) : (
          users.map((user) => (
            <li key={user.id} className="top-user-item">
              <div>
                <strong>{user.name}</strong>
                <div className="muted">{user.className}</div>
              </div>
              <div className="top-user-metric">{user.totalPasses}</div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

export default memo(TopUsers);
