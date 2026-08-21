// Very small fetch helper. No fancy client library - just plain fetch,
// with the JWT (if we have one) attached automatically.

const API_URL = 'http://localhost:3000';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function getUser(): any {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user: any) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function api(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || res.statusText;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
  return data;
}
