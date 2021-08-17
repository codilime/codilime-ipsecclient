import { useState, useEffect, useContext } from 'react';
import { useFetchData, useGetLocation } from 'hooks';
import { VrfsContext } from 'context';
import { defaultVrf } from 'db';

export const useGetVrfs = () => {
  const { fetchData } = useFetchData();
  const { currentLocation, history } = useGetLocation();
  const {
    vrf: { loading },
    setVrf
  } = useContext(VrfsContext);
  const [vrfs, setVrfs] = useState([]);

  const findActiveVrfPage = () => {
    if (vrfs.length === 0) {
      setVrf(defaultVrf);
      history.push('/vrf/create');
    }
    if (currentLocation === 'create') {
      return setVrf(defaultVrf);
    }
    const currentVrf = vrfs.filter(({ id }) => id === parseInt(currentLocation));

    if (currentVrf.length > 0) {
      return setVrf((prev) => ({ ...prev, data: currentVrf[0] }));
    }
  };

  useEffect(() => {
    if (currentLocation && vrfs.length !== 0) findActiveVrfPage();
  }, [currentLocation, vrfs]);

  useEffect(() => {
    if (vrfs.length === 0 || loading) fetchData(setVrfs);
  }, [loading]);

  return { vrfs };
};
