export const defaultVrf = {
  data: {
    client_name: '',
    vlan: 0,
    crypto_ph1: [],
    crypto_ph2: [],
    physical_interface: '',
    active: false,
    local_as: 0,
    lan_ip: '',
    endpoints: null
  },
  softwareCrypto: { crypto_ph1: { encryption: [], integrity: [], key_exchange: [] }, crypto_ph2: { encryption: [], integrity: [], key_exchange: [] } },
  hardwareCrypto: { crypto_ph1: { encryption: [], integrity: [], key_exchange: [] }, crypto_ph2: { encryption: [], integrity: [], key_exchange: [] } },
  loading: false,
  hardware: false,
  vrfs: [],
  error: null,
  success: false
};

export const tableSoftwareHeaderSchema = [{ item: 'Remote IP' }, { item: 'Tunnel local IP' }, { item: 'Tunnel peer IP' }, { item: 'PSK' }, { item: 'NAT' }, { item: 'BGP' }, { item: 'ACTION' }];

export const tableHardwaHeaderSchema = [
  { item: 'Remote IP' },
  { item: 'Tunnel local IP' },
  { item: 'Tunnel peer IP' },
  { item: 'PSK' },
  { item: 'Remote AS' },
  { item: 'Source interface' },
  { item: 'BGP' },
  { item: 'ACTION' }
];

export const emptyEndpointSchema = {
  remote_ip_sec: '',
  local_ip: '',
  peer_ip: '',
  psk: '',
  nat: false,
  bgp: false
};

export const emptyHardwareSchema = {
  remote_ip_sec: '',
  local_ip: '',
  peer_ip: '',
  psk: '',
  remote_as: 0,
  source_interface: '',
  bgp: false
};

export const endpointInputSchema = [
  { type: 'text', name: 'remote_ip_sec', placeholder: 'Enter remote IP' },
  { type: 'text', name: 'local_ip', placeholder: 'Enter local IP' },
  { type: 'text', name: 'peer_ip', placeholder: 'Enter peer IP' },
  { type: 'password', name: 'psk', placeholder: 'Enter PSK' },
  { type: 'checkbox', name: 'nat' },
  { type: 'checkbox', name: 'bgp' }
];
export const endpointHardwareSchema = [
  { type: 'text', name: 'remote_ip_sec', placeholder: 'Enter remote IP' },
  { type: 'text', name: 'local_ip', placeholder: 'Enter local IP' },
  { type: 'text', name: 'peer_ip', placeholder: 'Enter peer IP' },
  { type: 'password', name: 'psk', placeholder: 'Enter PSK' },
  { type: 'number', name: 'remote_as', placeholder: '0' },
  { type: 'text', name: 'source_interface', placeholder: 'Enter source interface' },
  { type: 'checkbox', name: 'bgp' }
];

export const maxValueForLocalAS = Math.pow(2, 32);
export const maxValueForVlan = 4094;
export const maxValueForRemoteAS = 4094;
export const minValueForVlanRemoteASLocalAS = 1;

export const DynamicVRFView = {
  mainVRFViewColumnOne: [
    { type: 'text', name: 'client_name', placeholder: 'i.e. VRF1 Office', text: 'Name:' },
    { type: 'text', name: 'lan_ip', placeholder: 'i. e. 10.0.0.1/24', text: 'Lan IP / Mask:' },
    { type: 'text', name: 'physical_interface', placeholder: 'i. e. eth0', text: 'Physical interface:' }
  ],
  mainVRFViewColumnTwo: [
    { type: 'text', name: 'local_as', text: 'BGP Local AS' },
    { type: 'text', name: 'vlan', text: 'VLAN', max: maxValueForVlan, min: minValueForVlanRemoteASLocalAS, step: '1' },
    { type: 'checkbox', name: 'active', text: 'Active' }
  ],
  mainVRFViewColumnThree: [
    { name: 'crypto_ph1', text: 'Crypto phase 1' },
    { name: 'crypto_ph2', text: 'Crypto phase 2' }
  ]
};
