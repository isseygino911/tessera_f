// Single fetch wrapper for the whole app. Keeps JSON parsing, error
// shaping, and admin cookie credentials in one place.

class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const init = {
    method,
    credentials: 'include',
    headers: {},
  };

  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const res = await fetch(`/api${path}`, init);

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data;
}

export const api = {
  getProducts: () => request('/products'),
  createOrder: (payload) => request('/orders', { method: 'POST', body: payload }),

  adminLogin: (password) => request('/admin/login', { method: 'POST', body: { password } }),
  adminLogout: () => request('/admin/logout', { method: 'POST' }),
  adminMe: () => request('/admin/me'),

  adminGetProducts: () => request('/admin/products'),
  adminGetProduct: (id) => request(`/admin/products/${id}`),
  adminCreateProduct: (payload) => request('/admin/products', { method: 'POST', body: payload }),
  adminUpdateProduct: (id, payload) => request(`/admin/products/${id}`, { method: 'PUT', body: payload }),
  adminDeleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),

  adminGetOrders: (status) => request(`/admin/orders${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  adminGetOrder: (id) => request(`/admin/orders/${id}`),
  adminUpdateOrderStatus: (id, status) => request(`/admin/orders/${id}`, { method: 'PATCH', body: { status } }),
};

export { ApiError };
