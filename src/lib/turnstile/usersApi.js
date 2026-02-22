import { USERS_API } from './constants';

export async function fetchUsersApi() {
  const response = await fetch(USERS_API);

  if (!response.ok) {
    throw new Error(`Users so'rovida xato: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const raw = await response.text();
    throw new Error(`JSON kelmadi. Javob boshi: ${raw.slice(0, 30)}`);
  }

  const payload = await response.json();
  const list = Array.isArray(payload) ? payload : payload.users;

  if (!Array.isArray(list)) {
    throw new Error("Users formati noto'g'ri. Array kerak.");
  }

  return list;
}

export async function createUserApi(payload) {
  const response = await fetch(USERS_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Saqlashda xato: ${response.status}`);
  }
}

export async function patchUserApi(userId, payload) {
  const response = await fetch(`${USERS_API}/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Yangilashda xato: ${response.status}`);
  }
}
