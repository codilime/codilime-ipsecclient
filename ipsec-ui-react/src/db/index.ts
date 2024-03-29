/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import {
  ContextProps,
  EndpointsType,
  DetailsTypes,
  EndpointSchemaType,
  CryptoTypes,
  SoftwareCryptoDataTypes,
  HeadersLogsType,
  AdvantageConfigType,
  HeadersNameProps,
  HeadersNameValue
} from 'interface/index';

const softwareCryptoTypes: SoftwareCryptoDataTypes = {
  encryption: [
    '',
    'des',
    '3des',
    'aes',
    'aes128',
    'aes192',
    'aes256',
    'aes128ctr',
    'aes192ctr',
    'aes256ctr',
    'aes128ccm8',
    'aes128ccm64',
    'aes128ccm12',
    'aes128ccm96',
    'aes128ccm16',
    'aes128ccm128',
    'aes128ccm',
    'aes192ccm8',
    'aes192ccm64',
    'aes192ccm12',
    'aes192ccm96',
    'aes192ccm16',
    'aes192ccm128',
    'aes192ccm',
    'aes256ccm8',
    'aes256ccm64',
    'aes256ccm12',
    'aes256ccm96',
    'aes256ccm16',
    'aes256ccm128',
    'aes256ccm',
    'aes128gcm8',
    'aes128gcm64',
    'aes128gcm12',
    'aes128gcm96',
    'aes128gcm16',
    'aes128gcm128',
    'aes128gcm',
    'aes192gcm8',
    'aes192gcm64',
    'aes192gcm12',
    'aes192gcm96',
    'aes192gcm16',
    'aes192gcm128',
    'aes192gcm',
    'aes256gcm8',
    'aes256gcm64',
    'aes256gcm12',
    'aes256gcm96',
    'aes256gcm16',
    'aes256gcm128',
    'aes256gcm',
    'aes128gmac',
    'aes192gmac',
    'aes256gmac',
    'chacha20poly1305',
    'chacha20poly1305compat',
    'blowfish',
    'blowfish128',
    'blowfish192',
    'blowfish256',
    'camellia',
    'camellia128',
    'camellia192',
    'camellia256',
    'camellia128ctr',
    'camellia192ctr',
    'camellia256ctr',
    'camellia128ccm8',
    'camellia128ccm64',
    'camellia128ccm12',
    'camellia128ccm96',
    'camellia128ccm16',
    'camellia128ccm128',
    'camellia192ccm8',
    'camellia192ccm64',
    'camellia192ccm12',
    'camellia192ccm96',
    'camellia192ccm16',
    'camellia192ccm128',
    'camellia256ccm8',
    'camellia256ccm64',
    'camellia256ccm12',
    'camellia256ccm96',
    'camellia256ccm16',
    'camellia256ccm128',
    'cast128',
    'serpent',
    'serpent128',
    'serpent192',
    'serpent256',
    'twofish',
    'twofish128',
    'twofish192',
    'twofish256'
  ],
  integrity: ['', 'sha', 'sha1', 'sha1_160', 'sha256', 'sha2_256', 'sha256_96', 'sha2_256_96', 'sha384', 'sha2_384', 'sha512', 'sha2_512', 'md5', 'md5_128', 'aesxcbc', 'camelliaxcbc', 'aescmac'],
  key_exchange: [
    '',
    'modpnone',
    'modpnull',
    'modp768',
    'modp1024',
    'modp1536',
    'modp2048',
    'modp3072',
    'modp4096',
    'modp6144',
    'modp8192',
    'ecp192',
    'ecp224',
    'ecp256',
    'ecp384',
    'ecp521',
    'modp1024s160',
    'modp2048s224',
    'modp2048s256',
    'ecp224bp',
    'ecp256bp',
    'ecp384bp',
    'ecp512bp',
    'curve25519',
    'x25519',
    'curve448',
    'x448'
  ]
};

const softwareCrypto: CryptoTypes = {
  crypto_ph1: softwareCryptoTypes,
  crypto_ph2: softwareCryptoTypes
};

const hardwareCrypto: CryptoTypes = {
  crypto_ph1: {
    encryption: [],
    integrity: [],
    key_exchange: []
  },
  crypto_ph2: {
    encryption: [],
    integrity: [],
    key_exchange: []
  }
};

export const defaultVrf: ContextProps = {
  data: {
    client_name: '',
    crypto_ph1: '',
    crypto_ph2: '',
    physical_interface: 'eth0',
    active: false,
    ospf: false,
    local_as: 0,
    vlan: [],
    endpoint: []
  },
  softwareCrypto: softwareCrypto,
  hardwareCrypto: hardwareCrypto,
  certificates: [],
  vrf: [],
  notifications: [],
  sourceInterface: [],
  actionStatus: [],
  loading: false,
  hardware: false,
  error: null,
  success: false,
  restConf: { switch_address: '', switch_password: '', switch_username: '' },
  switchVersion: '',
  version: ''
};

export const tableSoftwareHeaderSchema = [
  { header: 'Remote IP' },
  { header: 'Tunnel local IP' },
  { header: 'Tunnel peer IP' },
  { header: 'PSK / Certificates' },
  { header: 'NAT' },
  { header: 'BGP' },
  { header: 'ACTION' }
];

export const tableHardwareHeaderSchema = [
  { header: 'Remote IP' },
  { header: 'Tunnel local IP' },
  { header: 'Tunnel peer IP' },
  { header: 'PSK / Certificates' },
  { header: 'Remote AS' },
  { header: 'Source interface' },
  { header: 'BGP' },
  { header: 'ACTION' }
];

export const EndpointSchema: EndpointsType = {
  remote_ip_sec: '',
  local_ip: '',
  peer_ip: '',
  authentication: {
    type: '',
    psk: '',
    local_cert: '',
    remote_cert: '',
    private_key: '',
    pkcs12_base64: '',
    local_id: ''
  },
  remote_as: 0,
  source_interface: '',
  nat: false,
  bgp: false
};
export const advantageSchema: AdvantageConfigType = {
  local_id: ''
};

export const endpointInputSchema: EndpointSchemaType[] = [
  { type: 'text', name: 'remote_ip_sec', placeholder: 'Remote IP', tooltip: 'IP address (IPv4) for remote endpoint address' },
  { type: 'text', name: 'local_ip', placeholder: 'Local IP', tooltip: 'Local (*IPv4/v6) address assigned to tunnnel interface' },
  { type: 'text', name: 'peer_ip', placeholder: 'Peer IP', tooltip: 'Remote (IPv4/IPv6) address inside tunel. Used also for BGP neighbor. ' },
  { type: 'password', name: 'psk', placeholder: 'PSK' },
  { type: 'text', name: 'local_id', placeholder: 'Local id' },
  { type: 'checkbox', name: 'nat' },
  { type: 'checkbox', name: 'bgp' }
];

export const endpointAdvancedSchema: EndpointSchemaType[] = [{ type: 'text', name: 'local_id', placeholder: 'Local id', text: 'Local ID:' }];

export const endpointHardwareSchema: EndpointSchemaType[] = [
  { type: 'text', name: 'remote_ip_sec', placeholder: 'Remote IP', tooltip: 'IP address (IPv4) for remote endpoint address' },
  { type: 'text', name: 'local_ip', placeholder: 'Local IP', tooltip: 'Local (*IPv4/v6) address assigned to tunnnel interface' },
  { type: 'text', name: 'peer_ip', placeholder: 'Peer IP', tooltip: 'Remote (IPv4/IPv6) address inside tunel. Used also for BGP neighbor.' },
  { type: 'password', name: 'psk', placeholder: 'PSK' },
  { type: 'text', name: 'local_id', placeholder: ' Local id' },
  { type: 'number', name: 'remote_as', placeholder: '0', tooltip: 'Remote BGP AS' },
  { type: 'text', name: 'source_interface', placeholder: 'Source interface', tooltip: 'Cisco physical interfaces to which IPSEC tunnel is attached (i.e. Vlan100 , GigabitEthernet1/1)' },
  { type: 'checkbox', name: 'bgp' }
];

export const maxValueForLocalAS = Math.pow(2, 32);
export const maxValueForVlan = 4094;
export const maxValueForRemoteAS = 4094;
export const minValueForVlanRemoteASLocalAS = 1;

export const DynamicVrfDetails: DetailsTypes[] = [
  { name: 'client_name', type: 'text', placeholder: 'i.e. VRF1 Office', text: 'Name:' },
  { name: 'crypto_ph1', text: 'Crypto phase 1' },
  { name: 'local_as', type: 'text', text: 'BGP Local AS' },
  { name: 'crypto_ph2', text: 'Crypto phase 2' },
  { name: 'active', type: 'checkbox', text: 'Active' },
  { name: 'ospf', type: 'checkbox', text: 'OSPF' }
];

export const DynamicVrfHardwareDetails: DetailsTypes[] = [
  { name: 'client_name', type: 'text', placeholder: 'i.e. VRF1 Office', text: 'Name:' },
  { name: 'crypto_ph1', text: 'Crypto phase 1' },
  { name: 'local_as', type: 'text', text: 'BGP Local AS' },
  { name: 'crypto_ph2', text: 'Crypto phase 2' },
  { name: 'active', type: 'checkbox', text: 'Active' }
];

export const DynamicLoginForm = [
  { type: 'password', name: 'password', text: 'Password', placeholder: 'Password' },
  { type: 'password', name: 'newPasswordConfirmation', text: 'Repeat new Password', placeholder: 'Repeat password' }
];
export const DynamicRestConfForm = [
  { type: 'text', name: 'switch_username', text: 'Login', placeholder: 'Login' },
  { type: 'password', name: 'switch_password', text: 'Password', placeholder: 'Password' },
  { type: 'text', name: 'switch_address', text: 'Switch address', placeholder: 'Auto complete' }
];

export const headerLogs: HeadersLogsType[] = [
  { name: HeadersNameProps.api, value: HeadersNameValue.api },
  { name: HeadersNameProps.front, value: HeadersNameValue.front },
  { name: HeadersNameProps.frr, value: HeadersNameValue.frr },
  { name: HeadersNameProps.reloadVtysh, value: HeadersNameValue.reloadVtysh },
  { name: HeadersNameProps.strongswan, value: HeadersNameValue.strongswan },
  { name: HeadersNameProps.strongswanReload, value: HeadersNameValue.strongswanReload },
  { name: HeadersNameProps.vrfs, value: HeadersNameValue.vrfs }
];
