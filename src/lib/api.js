// Single fetch wrapper for the whole app. Keeps JSON parsing, error
// shaping, and session cookie credentials in one place.

class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function request(path, { method = 'GET', body, rawBody, contentType } = {}) {
  const init = {
    method,
    credentials: 'include',
    headers: {},
  };

  if (rawBody !== undefined) {
    init.headers['Content-Type'] = contentType;
    init.body = rawBody;
  } else if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const res = await fetch(`/api${path}`, init);

  const resContentType = res.headers.get('content-type') || '';
  const data = resContentType.includes('application/json')
    ? await res.json().catch(() => null)
    : null;

  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data;
}

export const api = {
  getProducts: () => request('/products'),
  createOrder: (payload) => request('/orders', { method: 'POST', body: payload }),

  authSignup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
  authLogin: ({ email, password }) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),
  authLogout: () => request('/auth/logout', { method: 'POST' }),
  authMe: () => request('/auth/me'),
  updateMe: ({ name }) => request('/auth/me', { method: 'PATCH', body: { name } }),
  changePassword: (data) => request('/auth/me/password', { method: 'PUT', body: data }),

  getMyOrders: () => request('/orders'),
  getMyOrder: (id) => request(`/orders/${id}`),

  getAddresses: () => request('/addresses'),
  createAddress: (data) => request('/addresses', { method: 'POST', body: data }),
  updateAddress: (id, data) => request(`/addresses/${id}`, { method: 'PUT', body: data }),
  deleteAddress: (id) => request(`/addresses/${id}`, { method: 'DELETE' }),

  adminGetProducts: () => request('/admin/products'),
  adminGetProduct: (id) => request(`/admin/products/${id}`),
  adminCreateProduct: (payload) => request('/admin/products', { method: 'POST', body: payload }),
  adminUpdateProduct: (id, payload) =>
    request(`/admin/products/${id}`, { method: 'PUT', body: payload }),
  adminDeleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),

  adminUploadImage: (productId, file) =>
    request(`/admin/products/${productId}/images`, {
      method: 'POST',
      rawBody: file,
      contentType: file.type,
    }),
  adminUpdateImage: (productId, imageId, data) =>
    request(`/admin/products/${productId}/images/${imageId}`, { method: 'PATCH', body: data }),
  adminDeleteImage: (productId, imageId) =>
    request(`/admin/products/${productId}/images/${imageId}`, { method: 'DELETE' }),

  adminGetOrders: ({ status, q, page } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (q) params.set('q', q);
    if (page) params.set('page', page);
    const query = params.toString();
    return request(`/admin/orders${query ? `?${query}` : ''}`);
  },
  adminGetOrder: (id) => request(`/admin/orders/${id}`),
  adminUpdateOrder: (id, data) => request(`/admin/orders/${id}`, { method: 'PATCH', body: data }),

  adminGetSummary: () => request('/admin/summary'),
};

export { ApiError };
