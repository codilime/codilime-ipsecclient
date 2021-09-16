import { client } from 'api/';
import { useAppContext } from 'hooks/';

export const useFetchData = () => {
  const { setVrf } = useAppContext();

  const fetchData = () => client('vrfs');

  function handleTakeTime() {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
  }

  const postVrfData = async (payload: any) => {
    setVrf((prev) => ({ ...prev, loading: true }));
    try {
      const { id } = await client('vrfs', { ...payload }, { method: 'POST' });
      if (id) {
        setVrf((prev) => ({ ...prev, loading: false }));
        return id;
      }
    } catch (err: any) {
      setVrf((prev) => ({ ...prev, loading: false, error: err, notifications: [...prev.notifications, { time: handleTakeTime(), description: err.error }] }));
    }
  };

  const putVrfData = async (payload: any) => {
    setVrf((prev) => ({ ...prev, loading: true }));
    try {
      const data = await client(`vrfs/${payload.id}`, { ...payload }, { method: 'PUT' });
      if (data) {
        setVrf((prev) => ({ ...prev, loading: false }));
        return data;
      }
    } catch (err: any) {
      setVrf((prev) => ({ ...prev, loading: false, error: err, notifications: [...prev.notifications, { time: handleTakeTime(), description: err.error }] }));
    }
  };

  const deleteVrfData = async (id: number | string) => {
    setVrf((prev) => ({ ...prev, loading: true }));
    const res = await client(`vrfs/${id}`, {}, { method: 'DELETE' });
    if (res) {
      setVrf((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchSoftwareAlgorithms = () => client('algorithms/software');

  const fetchHardwarePh1 = () => client('algorithms/hardware/ph1');

  const fetchHardwarePh2 = () => client('algorithms/hardware/ph2');

  const fetchEndpointStatus = async (id: number | string) => {
    const data = await client(`metrics/${id}`);
    console.log(data);
  };

  return { fetchData, postVrfData, deleteVrfData, putVrfData, fetchSoftwareAlgorithms, fetchHardwarePh1, fetchHardwarePh2, fetchEndpointStatus };
};
