import React, { useState, createContext, useEffect } from 'react';

import PropTypes from 'prop-types';

import { defaultVrf } from 'db';
import { useFetchData } from 'hooks';

export const VrfsContext = createContext([defaultVrf]);

export const VrfsProvider = ({ children }) => {
  const [vrfs, setVrfs] = useState([]);
  const { fetchData, postVrfData } = useFetchData();
  useEffect(() => {
    fetchData(setVrfs);
  }, []);
  return <VrfsContext.Provider value={{ vrfs, setVrfs }}>{children}</VrfsContext.Provider>;
};
VrfsProvider.propTypes = {
  children: PropTypes.element
};
