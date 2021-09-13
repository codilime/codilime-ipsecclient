import { ChangeEvent, MouseEvent, Ref } from 'react';

export interface vrfDetail {
  client_name: string;
  vlans: any[];
  crypto_ph1: string[];
  crypto_ph2: string[];
  physical_interface: string;
  active: boolean;
  local_as: number;
  endpoints: null | endpointTypes;
}

export interface vlanType {
  vlan: number;
  ip: string;
}

export interface endpointTypes {
  remote_ip_sec: string;
  local_ip: string;
  peer_ip: string;
  authentication: endpointAuthentication;
  bgp: boolean;
  nat?: boolean;
  remote_as?: number;
  source_interface?: string;
}

export interface endpointAuthentication {
  type: string;
  psk: string;
  local_cert: string;
  remote_cert: string;
  private_key: string;
}

export interface cryptoTypes {
  crypto_ph1: cryptoPhTypes;
  crypto_ph2: cryptoPhTypes;
}

export interface cryptoPhTypes {
  encryption: string[];
  integrity: string[];
  key_exchange: string[];
}

export interface InputTypeProps {
  type: string;
  name: string;
  references: Ref<HTMLInputElement>;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onClick?: (e: MouseEvent<HTMLInputElement>) => void;
  checked?: boolean;
}

export interface ButtonTypeProps {
  name: string;
  className?: string;
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export interface endpointProps {
  id: string;
  remote_ip_sec: string;
  local_ip: string;
  peer_ip: string;
  psk: string;
  nat: boolean;
  bgp: boolean;
}

export interface NotificationTypeProps {
  open: boolean;
  handleToggle: () => void;
}

export interface activeSettingsProps {
  login: boolean;
  certificate: boolean;
  kredki: boolean;
  profile: boolean;
  restConf: boolean;
}

export interface VisualizationBoxTypeProps {
  x: number;
  y: number;
  width?: number;
  height?: number;
  title?: string;
  value?: any;
}
