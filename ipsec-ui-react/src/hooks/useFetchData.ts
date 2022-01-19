import { client } from 'api/';
import { useAppContext } from 'hooks/';
import { handleTakeTime } from 'utils/';

export const useFetchData = () => {
  const { setContext } = useAppContext();

  const fetchData = () => {
    try {
      const vrf = client('vrf');
      return vrf;
    } catch (err: any) {
      console.log(err);
    }
  };

  const postVrfData = async (payload: any) => {
    setContext((prev) => ({ ...prev, loading: true }));
    try {
      const res = await client('vrf', { ...payload }, { method: 'POST' });
      if (res) {
        setContext((prev) => ({ ...prev, loading: false }));
        return res;
      }
    } catch (err: any) {
      setContext((prev) => ({ ...prev, loading: false }));
    }
  };

  const patchVrfData = async (payload: any) => {
    try {
      setContext((prev) => ({ ...prev, loading: true }));
      const res = await client(`vrf=${payload.vrf.id}`, { ...payload }, { method: 'PATCH' });
      if (res.result === 'error') {
        setContext((prev) => ({ ...prev, notifications: [...prev.notifications, { id: prev.notifications.length + 1, message: res.error, errorTime: handleTakeTime() }] }));
      }
      if (res) {
        setContext((prev) => ({ ...prev, loading: false }));
        return res;
      }
    } catch (err: any) {
      setContext((prev) => ({ ...prev, loading: false }));
    }
  };

  const deleteVrfData = async (id: number | string) => {
    setContext((prev) => ({ ...prev, loading: true }));
    const res = await client(`vrf=${id}`, {}, { method: 'DELETE' });
    if (res) setContext((prev) => ({ ...prev, loading: false }));
  };

  const fetchEndpointStatus = async (id: number | string) => await client(`monitoring=${id}`);

  const fetchLogs = async () => await client('log');

  const fetchRestConfData = async () => await client(`settings/restConf`);

  const fetchCertsData = async () => await client('ca');

  const fetchSourceData = async () => await client('source-interface');

  return {
    fetchData,
    postVrfData,
    deleteVrfData,
    patchVrfData,
    fetchEndpointStatus,
    fetchLogs,
    fetchRestConfData,
    fetchCertsData,
    fetchSourceData
  };
};
