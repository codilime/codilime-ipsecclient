import { useFetchData, useGetLocation, useAppContext } from 'hooks/';

export const useVrfLogic = () => {
  const { AppContext } = useAppContext();
  const { vrf } = AppContext();
  const { deleteVrfData } = useFetchData();
  const { history } = useGetLocation();
  const {
    data: { client_name, id },
    hardware,
    error,
    success
  } = vrf;

  const handleDelete = () => {
    if (!id) return;

    deleteVrfData(id);
    history.push('/vrf/create');
  };
  return { vrf, client_name, error, hardware, success, handleDelete };
};
