import { useFetchData, useAppContext } from 'hooks/';

export const useInitData = () => {
  const { fetchData, fetchCertsData, fetchSourceData } = useFetchData();

  const {
    context: { loading },
    setContext
  } = useAppContext();

  const fetchVrfData = async () => {
    const { vrf } = await fetchData();
    if (!vrf) return;
    setContext((prev) => ({ ...prev, vrf }));
  };

  // need have csr active to upload this data
  const fetchInitialData = async () => {
    const source = await fetchSourceData();
    console.log(source);
  };
  const fetchCerts = async () => {
    const { ca } = await fetchCertsData();
    if (!ca) return;
    setContext((prev) => ({ ...prev, certificates: [...ca] }));
  };

  return { fetchVrfData, fetchCerts, fetchInitialData, loading };
};
