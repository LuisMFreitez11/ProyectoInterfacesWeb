export async function authFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = options.headers ? { ...options.headers } : {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`http://localhost:3000${path}`, { ...options, headers });
  return res;
}

export async function fetchJson(path, options = {}) {
  const res = await authFetch(path, options);
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, ...json };
}
