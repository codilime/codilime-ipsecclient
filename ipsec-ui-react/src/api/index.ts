const API_URL = '/restconf/data/sico-ipsec:api';

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
    if (response.status === 200) {
      const res = await response.json();
      if (res) return res;
    }
    return response.ok;
  } catch (error: any) {
    return Promise.reject(error ? error.message : data);
  }
}
