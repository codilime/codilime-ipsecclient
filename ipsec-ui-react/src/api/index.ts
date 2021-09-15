const API_URL = '/api';

export async function client(endpoint: RequestInfo, data?: any, options?: RequestInit) {
  const { ...customConfig } = options ?? {};
  const headers = { 'Content-Type': 'application/json' };
  const config: RequestInit = {
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
  } catch (error: any) {
    return Promise.reject(error ? error.message : data);
  }
}
