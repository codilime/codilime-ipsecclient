/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { CSSProperties, ReactNode } from 'react';
import { RouteComponentProps } from 'react-router';

interface AuthenticationType {
  type: string;
  psk: string;
  local_cert: string;
  remote_cert: string;
  private_key: string;
  pkcs12_base64: string;
  local_id: string;
}

export interface EndpointsType {
  id?: number;
  remote_ip_sec: string;
  local_ip: string;
  peer_ip: string;
  authentication: AuthenticationType;
  bgp: boolean;
  remote_as: number;
  source_interface: string;
  nat?: boolean;
  vrf_id?: number;
}

export interface AdvantageConfigType {
  local_id: string;
}
export interface VrfDataTypes {
  client_name: string;
  local_as: number;
  physical_interface: string;
  crypto_ph1: string;
  crypto_ph2: string;
  active: boolean;
  ospf: boolean;
  endpoint: EndpointsType[] | [];
  vlan: VlanInterface[] | [];
  id?: number;
}

export interface SoftwareCryptoDataTypes {
  encryption: string[];
  integrity: string[];
  key_exchange: string[];
}

export interface CryptoTypes {
  crypto_ph1: SoftwareCryptoDataTypes;
  crypto_ph2: SoftwareCryptoDataTypes;
}
export interface CertificatesType {
  id: number;
  ca_file: string;
}

export interface NotificationsType {
  id: number;
  message: string;
  time: string;
}

export interface SourceInterfaceType {
  name: string;
}

export interface ActionStatusType {
  status: string;
  message: string;
}

export interface ContextProps {
  data: VrfDataTypes;
  softwareCrypto: CryptoTypes;
  hardwareCrypto: CryptoTypes;
  vrf: VrfDataTypes[] | [];
  certificates: CertificatesType[] | [];
  notifications: NotificationsType[] | [];
  loading: boolean;
  hardware: boolean;
  error: any;
  success: boolean;
  restConf: { switch_username: string; switch_password: string; switch_address: string };
  sourceInterface: SourceInterfaceType[] | [];
  switchVersion: string;
  version: string;
  actionStatus: ActionStatusType[] | [];
}

type NameProps = {
  client_name: 'client_name';
  crypto_ph1: 'crypto_ph1';
  local_as: 'local_as';
  crypto_ph2: 'crypto_ph2';
  active: 'active';
  ospf: 'ospf';
};
export interface DetailsTypes {
  name: keyof NameProps;
  type?: string;
  placeholder?: string;
  text?: string;
}

type EndpointNameProps = {
  remote_ip_sec: 'remote_ip_sec';
  local_ip: 'local_ip';
  peer_ip: 'peer_ip';
  psk: 'psk';
  local_id: 'local_id';
  remote_as: 'remote_as';
  source_interface: 'source_interface';
  nat: 'nat';
  bgp: 'bgp';
};

export interface EndpointSchemaType {
  name: keyof EndpointNameProps;
  type?: string;
  placeholder?: string;
  text?: string;
  tooltip?: string;
}

export interface MatchProps extends RouteComponentProps<{ id: string }> {}

export interface VlanInterface {
  vlan: number;
  lan_ip: string;
}

export interface MetricsType {
  id: number;
  local_ip: string;
  peer_ip: string;
  status: string;
}
export interface RestConfType {
  switch_username: string;
  switch_password: string;
  switch_address: string;
}

type ResultType = {
  default: 'default';
  success: 'success';
  error: 'error';
};

export interface DescriptionType {
  result: keyof ResultType;
  message: string;
}
export interface ChangePasswordType {
  password: string;
  newPasswordConfirmaton: string;
}

export interface VlanInterface {
  vlan: number;
  lan_ip: string;
}

export interface AppTheme {
  dark: CSSProperties;
  light: CSSProperties;
  common?: CSSProperties;
}

export enum HeadersNameProps {
  api = 'api',
  front = 'front',
  frr = 'frr',
  reloadVtysh = 'reload vtysh',
  strongswan = 'strongswan',
  strongswanReload = 'strongswan reload',
  vrfs = 'Vrfs / NAT'
}
export enum HeadersNameValue {
  api = 'api',
  front = 'front',
  frr = 'frr',
  reloadVtysh = 'reload_vtysh',
  strongswan = 'strongswan',
  strongswanReload = 'strongswan_reload',
  vrfs = 'Vrfs / NAT'
}

export interface HeadersLogsType {
  name: HeadersNameProps;
  value: HeadersNameValue;
}

export enum SettingOptionType {
  profile = 'profile',
  restConf = 'restConf',
  certificates = 'certificates',
  about = 'about'
}

export interface AboutListType {
  title: string;
  value: string;
  link?: string;
}

export interface DropDownListType {
  value: SettingOptionType;
  text: string;
  icon: ReactNode;
}
