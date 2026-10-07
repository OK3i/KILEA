import { TOKEN_KEY } from '../api/client.js';

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  return atob(padded);
}

export function readTokenUser(token = localStorage.getItem(TOKEN_KEY)) {
  if (!token) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(token.split('.')[1]));
    if (
      !Number.isSafeInteger(payload.sub) ||
      !['user', 'author', 'admin'].includes(payload.role) ||
      (payload.exp && payload.exp * 1000 <= Date.now())
    ) {
      return null;
    }

    return {
      id: payload.sub,
      name: typeof payload.name === 'string' ? payload.name : payload.email,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
