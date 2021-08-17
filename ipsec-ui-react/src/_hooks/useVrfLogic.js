import { useContext } from 'react';
import { useFetchData, useGetLocation } from 'hooks';
import { VrfsContext } from 'context';

export const useVrfLogic = () => {
  const { vrf } = useContext(VrfsContext);
  const { deleteVrfData } = useFetchData();
  const { history } = useGetLocation();
  const { client_name, id } = vrf.data;

  const handleDelete = () => {
    deleteVrfData(id);
    history.push('/vrf/create');
  };
  return { vrf, client_name, handleDelete };
};
