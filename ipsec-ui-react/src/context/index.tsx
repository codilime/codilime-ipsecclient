import React, { useState, createContext, FunctionComponent, Dispatch, SetStateAction } from 'react';
import { defaultVrf } from 'db';
import { cryptoTypes, vlanType, vrfDetail } from '../interface/components';

interface VrfType {
  data: vrfDetail;
  softwareCrypto: cryptoTypes;
  hardwareCrypto: cryptoTypes;
  certificates: string[];
  vrfs: vrfDetail[];
  notifications: any[];
  vlans: vlanType[];
  loading: boolean;
  hardware: boolean;
  error: any;
  success: boolean;
}

interface contextType {
  vrf: VrfType;
  setVrf: Dispatch<SetStateAction<VrfType>>;
}

export const VrfsContext = createContext<contextType | null>(null);

export const VrfsProvider: FunctionComponent = ({ children }) => {
  const [vrf, setVrf] = useState<VrfType>(defaultVrf);
  return <VrfsContext.Provider value={{ vrf, setVrf }}>{children}</VrfsContext.Provider>;
};
