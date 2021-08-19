import { useState, useEffect, useContext } from 'react';
import { useFetchData, useGetLocation } from 'hooks';
import { VrfsContext } from 'context';
import { HardwareId } from 'constant';
import { defaultVrf } from 'db';

export const useGetVrfs = () => {
  const { fetchData, fetchHardwarePh1, fetchHardwarePh2, fetchSoftwareAlgorithms } = useFetchData();
  const { currentLocation, history } = useGetLocation();
  const {
    vrf: { loading },
    setVrf
  } = useContext(VrfsContext);
  const [vrfs, setVrfs] = useState([]);

  const softwareCryptoPhase = async () => {
    const crypto = await fetchSoftwareAlgorithms();
    setVrf((prev) => ({ ...prev, softwareCrypto: { crypto_ph1: crypto, crypto_ph2: crypto } }));
  };

  const hardwareCryptoPhase = async () => {
    const crypto_ph1 = await fetchHardwarePh1();
    const crypto_ph2 = await fetchHardwarePh2();
    setVrf((prev) => ({ ...prev, hardwareCrypto: { crypto_ph1, crypto_ph2 } }));
  };

  const findActiveVrfPage = async () => {
    if (vrfs.length === 0) {
      setVrf((prev) => ({ ...prev, data: defaultVrf.data }));
      history.push('/vrf/create');
    }
    if (currentLocation === 'create') {
      setVrf((prev) => ({ ...prev, data: defaultVrf.data }));
    }
    const currentVrf = vrfs.filter(({ id }) => id === parseInt(currentLocation));

    if (currentVrf.length > 0) {
      return setVrf((prev) => ({ ...prev, data: currentVrf[0] }));
    }
  };

  useEffect(() => {
    softwareCryptoPhase();
    hardwareCryptoPhase();
  }, []);

  useEffect(() => {
    if (currentLocation === HardwareId) {
      setVrf((prev) => ({ ...prev, hardware: true }));
    } else {
      setVrf((prev) => ({ ...prev, hardware: false }));
    }
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation || vrfs.length !== 0) findActiveVrfPage();
  }, [currentLocation, vrfs]);

  useEffect(() => {
    if (vrfs.length === 0 || loading) fetchData(setVrfs);
  }, [loading]);

  return { vrfs };
};
