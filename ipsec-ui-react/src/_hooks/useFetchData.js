import { useContext } from 'react';
import { client } from 'api';
import { VrfsContext } from 'context';

export const useFetchData = () => {
  const { setVrf } = useContext(VrfsContext);
  const fetchData = () => client('vrfs');

  const postVrfData = async (payload) => {
    try {
      const { id } = await client('vrfs', { ...payload }, { method: 'POST' });
      setVrf((prev) => ({ ...prev, loading: true }));
      if (id) {
        setVrf((prev) => ({ ...prev, loading: false, success: true }));
        return id;
      }
    } catch (error) {
      setVrf((prev) => ({ ...prev, loading: false, error }));
    }
  };

  const putVrfData = async (payload) => {
    try {
      setVrf((prev) => ({ ...prev, loading: true }));
      const data = await client(`vrfs/${payload.id}`, { ...payload }, { method: 'PUT' });
      if (data) {
        setVrf((prev) => ({ ...prev, loading: false, success: true }));
        return data;
      }
    } catch (error) {
      setVrf((prev) => ({ ...prev, loading: false, error }));
    }
  };

  const deleteVrfData = (id) => client(`vrfs/${id}`, {}, { method: 'DELETE' });

  const fetchSoftwareAlgorithms = () => client('algorithms/software');

  const fetchHardwarePh1 = () => client('algorithms/hardware/ph1');

  const fetchHardwarePh2 = () => client('algorithms/hardware/ph2');

  const fetchEndpointStatus = async (id) => {
    const data = await client(`metrics/${id}`);
    console.log(data);
  };

  return { fetchData, postVrfData, deleteVrfData, putVrfData, fetchSoftwareAlgorithms, fetchHardwarePh1, fetchHardwarePh2, fetchEndpointStatus };
};
