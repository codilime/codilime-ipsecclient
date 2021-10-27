import { useFetchData, useAppContext } from 'hooks/';

export const useInitData = () => {
  const { fetchData, fetchCertsData } = useFetchData();

  const {
    context: { loading },
    setContext
  } = useAppContext();

  const fetchVrfData = async () => {
    const { vrf } = await fetchData();
    if (!vrf) return;
    setContext((prev) => ({ ...prev, vrf }));
  };

  const fetchCerts = async () => {
    const { ca } = await fetchCertsData();
    if (!ca) return;
    setContext((prev) => ({ ...prev, certificates: [...ca] }));
  };

  return { fetchVrfData, fetchCerts, loading };
};
