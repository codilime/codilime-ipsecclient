import { client } from 'api/';
import { useAppContext } from 'hooks/';
import { handleTakeTime } from 'utils/';

export const useFetchData = () => {
  const { setContext } = useAppContext();

  const fetchData = () => client('vrf');

  const postVrfData = async (payload: any) => {
    setContext((prev) => ({ ...prev, loading: true }));
    try {
      const res = await client('vrf', { ...payload }, { method: 'POST' });
      if (res) setContext((prev) => ({ ...prev, loading: false }));
      return res;
    } catch (err: any) {
      setContext((prev) => ({ ...prev, loading: false, error: err, notifications: [...prev.notifications, { id: prev.notifications.length + 1, errorTime: handleTakeTime(), message: err.error }] }));
    }
  };

  const patchVrfData = async (payload: any) => {
    setContext((prev) => ({ ...prev, loading: true }));
    try {
      const res = await client(`vrf=${payload.vrf.id}`, { ...payload }, { method: 'PATCH' });
      if (res) setContext((prev) => ({ ...prev, loading: false }));
      return res;
    } catch (err: any) {
      setContext((prev) => ({ ...prev, loading: false, error: err, notifications: [...prev.notifications, { id: prev.notifications.length + 1, errorTime: handleTakeTime(), message: err.error }] }));
    }
  };

  const deleteVrfData = async (id: number | string) => {
    setContext((prev) => ({ ...prev, loading: true }));
    const res = await client(`vrf=${id}`, {}, { method: 'DELETE' });
    if (res) setContext((prev) => ({ ...prev, loading: false }));
  };

  const fetchEndpointStatus = async (id: number | string) => await client(`monitoring=${id}`);

  const fetchLogsList = async () => await client('listlogs');

  const fetchLogsData = async (log: string) => await client(`logs/${log}`);

  const fetchRestConfData = async () => await client(`settings/restConf`);

  const fetchCertsData = async () => await client('cas');

  return {
    fetchData,
    postVrfData,
    deleteVrfData,
    patchVrfData,
    fetchEndpointStatus,
    fetchLogsList,
    fetchLogsData,
    fetchRestConfData,
    fetchCertsData
  };
};
