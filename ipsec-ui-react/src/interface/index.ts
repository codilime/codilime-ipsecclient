import { RouteComponentProps } from 'react-router';

interface authenticationType {
  type: string;
  psk: string;
  local_cert: string;
  remote_cert: string;
  private_key: string;
}

export interface endpointsType {
  remote_ip_sec: string;
  local_ip: string;
  peer_ip: string;
  authentication: authenticationType;
  bgp: boolean;
  nat?: boolean;
  remote_as?: number;
  source_interface?: string;
}

export interface vrfDataTypes {
  client_name: string;
  vlans?: vlanInterface[];
  vlan: number;
  lan_ip: string;
  crypto_ph1: string[];
  crypto_ph2: string[];
  physical_interface: string;
  active: boolean;
  local_as: number;
  endpoints: endpointsType[] | null;
  id?: string | number;
}

export interface softwareCryptoDataTypes {
  encryption: string[];
  integrity: string[];
  key_exchange: string[];
}

export interface CryptoTypes {
  crypto_ph1: softwareCryptoDataTypes;
  crypto_ph2: softwareCryptoDataTypes;
}

export interface ContextProps {
  data: vrfDataTypes;
  softwareCrypto: CryptoTypes;
  hardwareCrypto: CryptoTypes;
  certificates: Array<any>;
  vrfs: Array<any>;
  notifications: Array<any>;
  vlans: Array<any>;
  loading: boolean;
  hardware: boolean;
  error: any;
  success: boolean;
}

type nameProps = {
  client_name: 'client_name';
  crypto_ph1: 'crypto_ph1';
  local_as: 'local_as';
  crypto_ph2: 'crypto_ph2';
  active: 'active';
};
export interface DetailsTypes {
  name: keyof nameProps;
  type?: string;
  placeholder?: string;
  text?: string;
}
type endpointNameProps = {
  remote_ip_sec: 'remote_ip_sec';
  local_ip: 'local_ip';
  peer_ip: 'peer_ip';
  psk: 'psk';
  remote_as: 'remote_as';
  source_interface: 'source_interface';
  nat: 'nat';
  bgp: 'bgp';
};

export interface endpointSchemaType {
  name: keyof endpointNameProps;
  type?: string;
  placeholder?: string;
  text?: string;
}

export interface MatchProps extends RouteComponentProps<{ id: string }> {}

export interface vlanInterface {
  vlan: number;
  lan_ip: string;
}
