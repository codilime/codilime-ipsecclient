import { ChangeEvent, MouseEvent, Ref } from 'react';

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
