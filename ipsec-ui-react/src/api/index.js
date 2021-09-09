const API_URL = '/api';

export async function client(endpoint, data, options) {
  const { ...customConfig } = options ?? {};
  const headers = { 'Content-Type': 'application/json' };
  const config = {
    method: data ? 'POST' : 'GET',
    body: data ? JSON.stringify(data) : null,
    headers: {
      ...headers,
      ...customConfig.headers
    },
    ...customConfig
  };
  try {
    const response = await window.fetch(`${API_URL}/${endpoint}`, config);
    const res = await response.json();
    if (response.ok) {
      return res;
    }
    return Promise.reject(res);
  } catch (error) {
    return Promise.reject(error ? error.message : data);
  }
}
