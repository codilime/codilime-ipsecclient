import { useFetchData, useAppContext } from 'hooks/';

export const useInitData = () => {
  const { fetchData, fetchHardwarePh1, fetchHardwarePh2, fetchSoftwareAlgorithms, fetchCertsData } = useFetchData();

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

  const fetchCerts = async () => {
    const certificates = await fetchCertsData();
    if (!certificates) throw new Error('Hardware_ph nie został pobrany');
    setVrf((prev) => ({ ...prev, certificates }));
  };

  return { fetchVrfData, fetchVrfSettings, fetchCerts, loading };
};
