import { useContext } from 'react';
import { client } from 'api';
import { useGetLocation } from 'hooks';
import { VrfsContext } from 'context';

export const useFetchData = () => {
  const { history } = useGetLocation();
  const { setVrf } = useContext(VrfsContext);

  const fetchData = async (action) => {
    const data = await client('vrfs');
    action(data);
    setVrf((prev) => ({ ...prev, loading: false }));
  };

  const postVrfData = async (payload) => {
    const { id } = await client('vrfs', { ...payload }, '', { method: 'POST' });
    history.push(`/vrf/${id}`);
    setVrf((prev) => ({ ...prev, loading: true }));
  };

  const putVrfData = async (payload) => {
    await client(`vrfs/${payload.id}`, { ...payload }, '', { method: 'PUT' });
    setVrf((prev) => ({ ...prev, loading: true }));
  };

  const deleteVrfData = async (id) => {
    await client(`vrfs/${id}`, {}, '', { method: 'DELETE' });
    setVrf((prev) => ({ ...prev, loading: true }));
  };

  const fetchSoftwareAlgorithms = async (action) => {
    const data = await client('algorithms/software');
    action(data);
  };
  const fetchHardwarePh1 = async () => {
    const data = await client('algorithms/hardware/ph2');
  };
  const fetchHardwarePh2 = async () => {
    const data = await client('algorithms/hardware/ph2');
  };

  return { fetchData, postVrfData, deleteVrfData, putVrfData, fetchSoftwareAlgorithms, fetchHardwarePh1, fetchHardwarePh2 };
};
