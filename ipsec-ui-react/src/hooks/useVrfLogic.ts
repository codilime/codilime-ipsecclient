import { useFetchData, useGetLocation, useAppContext } from 'hooks/';

export const useVrfLogic = () => {
  const { context } = useAppContext();
  const { deleteVrfData } = useFetchData();
  const { history } = useGetLocation();
  const {
    data: { client_name, id, endpoint },
    hardware,
    error,
    success
  } = context;

  const handleDelete = () => {
    if (!id) return;

    deleteVrfData(id);
    history.push('/vrf/create');
  };
  return { context, client_name, error, vrf_id: id, hardware, success, endpoint, handleDelete };
};
