import { REQUEST_TIMEOUT_MS, USERS_API } from './constants';

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseJsonResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const raw = await response.text();
    throw new Error(`JSON kelmadi. Javob boshi: ${raw.slice(0, 40)}`);
  }

  return response.json();
}

export async function fetchUsersApi() {
  const response = await fetchWithTimeout(USERS_API);

  if (!response.ok) {
    throw new Error(`Users so'rovida xato: ${response.status}`);
  }

  const payload = await parseJsonResponse(response);
  const list = Array.isArray(payload) ? payload : payload.users;

  if (!Array.isArray(list)) {
    throw new Error("Users formati noto'g'ri. Array kerak.");
  }

  return list;
}

export async function createUserApi(payload) {
  const response = await fetchWithTimeout(USERS_API, {
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
  const response = await fetchWithTimeout(`${USERS_API}/${userId}`, {
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
