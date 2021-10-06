import { useFetchData, useAppContext } from 'hooks/';

export const useInitData = () => {
  const { fetchData } = useFetchData();

  const {
    vrf: { loading },
    setVrf
  } = useAppContext();

  const fetchVrfData = async () => {
    const vrfs = await fetchData();
    if (!vrfs) {
      throw new Error('Hardware_ph nie został pobrany');
    }
    setVrf((prev) => ({ ...prev, vrfs }));
  };

  return { fetchVrfData, loading };
};
