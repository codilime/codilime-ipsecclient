import React, { useState, useEffect } from 'react';
import { useFetchData } from 'hooks';

export const useGetVrfs = () => {
  const { fetchData } = useFetchData();
  const [vrfs, setVrfs] = useState([]);
  useEffect(() => {
    fetchData(setVrfs);
  }, []);
  return { vrfs };
};
