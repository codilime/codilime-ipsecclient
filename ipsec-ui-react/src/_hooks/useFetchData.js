import { client } from 'api';

export const useFetchData = () => {
  const fetchData = async (action) => {
    try {
      const data = await client('vrfs');
      action(data);
    } catch (err) {
      throw new Error('problem with request');
    }
  };
  const postVrfData = async (payload) => {
    try {
      await client('vrfs', { ...payload }, '', { method: 'POST' });
    } catch (err) {
      throw new Error('problem with request');
    }
  };
  const putVrfData = async (id, payload) => {
    try {
      await client(`vrfs/${id}`, { payload }, '', { method: 'PUT' });
    } catch (err) {
      throw new Error('problem with request');
    }
  };
  const deleteVrfData = async (id) => {
    try {
      await client(`vrfs/${id}`, {}, '', { method: 'DELETE' });
    } catch (err) {
      throw new Error('problem with request');
    }
  };

  return { fetchData, postVrfData, deleteVrfData, putVrfData };
};
