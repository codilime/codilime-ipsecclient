import { client } from 'api/';
import { useFetchData, useAppContext } from 'hooks/';
import { useDataContext } from './useAppContext';

export const useInitData = () => {
  const { fetchData, fetchCertsData, fetchSourceData } = useFetchData();

  const { setAppContext } = useDataContext();
  // const {
  //   context: { loading },
  //   setContext
  // } = useAppContext();

  const fetchVrfData = async () => {
    const { vrf } = await fetchData();

    if (!vrf) return;
    setAppContext((prev) => ({ ...prev, vrf }));
  };

  const fetchTest = async () => {
    const { vrf } = await fetchData();
    if (!vrf) return;

    const { ca } = await fetchCertsData();
    if (!ca) return;
    setAppContext((prev) => ({ ...prev, vrf, certificates: [...ca] }));
  };
  // need have csr active to upload this data
  // const fetchInitialData = async () => {
  //   const source = await fetchSourceData();
  //   console.log(source);
  // };
  const fetchCerts = async () => {
    const { ca } = await fetchCertsData();
    if (!ca) return;
    setAppContext((prev) => ({ ...prev, certificates: [...ca] }));
  };

  //return { fetchVrfData, fetchCerts, fetchInitialData, loading };
  return { fetchVrfData, fetchCerts, fetchTest };
};
