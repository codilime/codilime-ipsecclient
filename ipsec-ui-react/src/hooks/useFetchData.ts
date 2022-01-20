import { client } from 'api/';
import { useAppContext } from 'hooks/';

export const useFetchData = () => {
  const { setContext } = useAppContext();

  const fetchData = async () => await client('vrf');

  const postVrfData = async (payload: any) => {
    try {
      setContext((prev) => ({ ...prev, loading: true }));
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
      console.log(payload);
      setContext((prev) => ({ ...prev, loading: true }));
      const res = await client(`vrf=${payload.vrf.id}`, { ...payload }, { method: 'PATCH' });
      if (res.result === 'error') {
        payload.vrf.active = false;
        await client(`vrf=${payload.vrf.id}`, { ...payload }, { method: 'PATCH' });
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
    try {
      setContext((prev) => ({ ...prev, loading: true }));
      const res = await client(`vrf=${id}`, {}, { method: 'DELETE' });
      if (res) setContext((prev) => ({ ...prev, loading: false }));
    } catch (err) {
      setContext((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchEndpointStatus = async (id: number | string) => await client(`monitoring=${id}`);

  const fetchLogs = async () => await client('log');

  const fetchCertsData = async () => await client('ca');

  const fetchRestConfData = async () => await client(`settings/restConf`);

  const fetchSystemName = async () => await client('setting=system_name');

  const fetchAppVersion = async () => await client('setting=app_version');

  const fetchSourceData = async () => await client('source-interface');

  const fetchErrorData = async () => await client('error');

  return {
    fetchData,
    postVrfData,
    deleteVrfData,
    patchVrfData,
    fetchEndpointStatus,
    fetchLogs,
    fetchRestConfData,
    fetchCertsData,
    fetchSourceData,
    fetchSystemName,
    fetchAppVersion,
    fetchErrorData
  };
};
