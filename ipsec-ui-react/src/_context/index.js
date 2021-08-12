import React, { useState, createContext } from 'react';
import PropTypes from 'prop-types';
import { defaultVrf } from 'db';

export const VrfsContext = createContext(defaultVrf);

export const VrfsProvider = ({ children }) => {
  const [vrf, setVrf] = useState(defaultVrf);
  return <VrfsContext.Provider value={{ vrf, setVrf }}>{children}</VrfsContext.Provider>;
};

VrfsProvider.propTypes = {
  children: PropTypes.element
};
