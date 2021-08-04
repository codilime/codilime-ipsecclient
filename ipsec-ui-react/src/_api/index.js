import { detailApiAddress } from '../config'

export async function client(endpoint, data, AuthToken, options) {
  const { ...customConfig } = options ?? {};
  const headers = { 'Content-Type': 'application/json' };
  const config = {
    method: data ? 'POST' : 'GET',
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      ...headers,
      Authorization: AuthToken ? `Bearer ${AuthToken}` : '',
      ...customConfig.headers
    },
    ...customConfig
  };
  try {
    const response = await window.fetch(`${detailApiAddress}/${endpoint}`, config);
    let res = await response.json();
    if (response.ok) {
      return res;
    }
    return Promise.reject(res);
  } catch (error) {
    return Promise.reject(error ? error.message : data);
  }
}
