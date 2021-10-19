import { useFetchData, useAppContext } from 'hooks/';

export const useInitData = () => {
  const { fetchData, fetchCertsData } = useFetchData();

  const {
    context: { loading },
    setContext
  } = useAppContext();

  const fetchVrfData = async () => {
    const { vrf } = await fetchData();
    if (!vrf) throw new Error('Hardware_ph nie został pobrany');
    setContext((prev) => ({ ...prev, vrf }));
  };

  const fetchCerts = async () => {
    const certificates = await fetchCertsData();
    if (!certificates) throw new Error('Hardware_ph nie został pobrany');
    setContext((prev) => ({ ...prev, certificates }));
  };

  return { fetchVrfData, fetchCerts, loading };
};
