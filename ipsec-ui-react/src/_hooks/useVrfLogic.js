import { useState, useEffect, useContext } from 'react';
import { useGetLocation, useGetVrfs } from 'hooks';
import { VrfsContext } from 'context';

export const useVrfLogic = () => {
  const { idVrf } = useGetLocation();
  const { vrfs } = useGetVrfs();
  const { vrf, setVrf } = useContext(VrfsContext);
  const findActiveVrfPage = () => {
    if (vrfs !== []) {
      const currentVrf = vrfs.filter((el) => el.id === idVrf);
      if (currentVrf.length > 0) {
        setVrf(...currentVrf);
      }
    }
  };
  useEffect(() => {
    if (idVrf) findActiveVrfPage();
  }, [idVrf, vrfs]);
  return { vrf };
};
