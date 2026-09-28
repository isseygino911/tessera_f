import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, ApiError } from '@/lib/api.js';

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
  };
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

describe('api auth methods', () => {
  it('authSignup posts name/email/password to /api/auth/signup and resolves with the user', async () => {
    const user = {
      id: 1,
      email: 'ada@example.com',
      name: 'Ada',
      avatarUrl: null,
      role: 'customer',
    };
    fetch.mockResolvedValueOnce(jsonResponse(201, { user }));

    const result = await api.authSignup({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'password1',
    });

    expect(result).toEqual({ user });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('/api/auth/signup');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'password1',
    });
  });

  it('authLogin posts email/password to /api/auth/login and resolves with the user', async () => {
    const user = {
      id: 1,
      email: 'ada@example.com',
      name: 'Ada',
      avatarUrl: null,
      role: 'customer',
    };
    fetch.mockResolvedValueOnce(jsonResponse(200, { user }));

    const result = await api.authLogin({ email: 'ada@example.com', password: 'password1' });

    expect(result).toEqual({ user });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('/api/auth/login');
    expect(init.method).toBe('POST');
  });

  it('authLogin rejects with an ApiError carrying the server message on 401', async () => {
    fetch.mockResolvedValueOnce(jsonResponse(401, { error: 'Email or password is incorrect' }));

    await expect(
      api.authLogin({ email: 'ada@example.com', password: 'wrong' })
    ).rejects.toMatchObject({ message: 'Email or password is incorrect', status: 401 });
  });

  it('authLogout posts to /api/auth/logout and resolves with { ok: true }', async () => {
    fetch.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    const result = await api.authLogout();

    expect(result).toEqual({ ok: true });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('/api/auth/logout');
    expect(init.method).toBe('POST');
  });

  it('authMe resolves with the user when authenticated', async () => {
    const user = {
      id: 1,
      email: 'ada@example.com',
      name: 'Ada',
      avatarUrl: null,
      role: 'customer',
    };
    fetch.mockResolvedValueOnce(jsonResponse(200, { user }));

    const result = await api.authMe();

    expect(result).toEqual({ user });
  });

  it('authMe rejects with an ApiError with status 401 when anonymous', async () => {
    fetch.mockResolvedValueOnce(jsonResponse(401, { error: 'Not authenticated' }));

    await expect(api.authMe()).rejects.toBeInstanceOf(ApiError);
    fetch.mockResolvedValueOnce(jsonResponse(401, { error: 'Not authenticated' }));
    await expect(api.authMe()).rejects.toMatchObject({ status: 401 });
  });
});
