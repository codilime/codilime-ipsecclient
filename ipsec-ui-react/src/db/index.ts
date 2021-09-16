import { ContextProps, endpointsType, DetailsTypes, endpointSchemaType } from 'interface/index';

export const defaultVrf: ContextProps = {
  data: {
    client_name: '',
    vlans: [],
    vlan: 0,
    lan_ip: '',
    crypto_ph1: [],
    crypto_ph2: [],
    physical_interface: '',
    active: false,
    local_as: 0,
    endpoints: null
  },
  softwareCrypto: { crypto_ph1: { encryption: [], integrity: [], key_exchange: [] }, crypto_ph2: { encryption: [], integrity: [], key_exchange: [] } },
  hardwareCrypto: { crypto_ph1: { encryption: [], integrity: [], key_exchange: [] }, crypto_ph2: { encryption: [], integrity: [], key_exchange: [] } },
  certificates: [],
  vrfs: [],
  notifications: [],
  vlans: [
    { vlan: 110, ip: '10.10.10.10/32' },
    { vlan: 100, ip: '10.10.10.10/16' },
    { vlan: 130, ip: '10.10.10.10/8' }
  ],
  loading: false,
  hardware: false,
  error: null,
  success: false
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

export const tableHardwaHeaderSchema = [
  { header: 'Remote IP' },
  { header: 'Tunnel local IP' },
  { header: 'Tunnel peer IP' },
  { header: 'PSK / Certificates' },
  { header: 'Remote AS' },
  { header: 'Source interface' },
  { header: 'BGP' },
  { header: 'ACTION' }
];

export const emptyEndpointSchema: endpointsType = {
  remote_ip_sec: '',
  local_ip: '',
  peer_ip: '',
  authentication: {
    type: '',
    psk: '',
    local_cert: '',
    remote_cert: '',
    private_key: ''
  },
  nat: false,
  bgp: false
};

export const emptyHardwareSchema: endpointsType = {
  remote_ip_sec: '',
  local_ip: '',
  peer_ip: '',
  authentication: {
    type: '',
    psk: '',
    local_cert: '',
    remote_cert: '',
    private_key: ''
  },
  remote_as: 0,
  source_interface: '',
  bgp: false
};

export const endpointInputSchema: endpointSchemaType[] = [
  { type: 'text', name: 'remote_ip_sec', placeholder: 'Enter remote IP' },
  { type: 'text', name: 'local_ip', placeholder: 'Enter local IP' },
  { type: 'text', name: 'peer_ip', placeholder: 'Enter peer IP' },
  { type: 'password', name: 'psk', placeholder: 'Enter PSK' },
  { type: 'checkbox', name: 'nat' },
  { type: 'checkbox', name: 'bgp' }
];
export const endpointHardwareSchema: endpointSchemaType[] = [
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

export const DynamicVrfDetails: DetailsTypes[] = [
  { name: 'client_name', type: 'text', placeholder: 'i.e. VRF1 Office', text: 'Name:' },
  { name: 'crypto_ph1', text: 'Crypto phase 1' },
  { name: 'local_as', type: 'text', text: 'BGP Local AS' },
  { name: 'crypto_ph2', text: 'Crypto phase 2' },
  { name: 'active', type: 'checkbox', text: 'Active' }
];

export const DynamicVrfHardwareDetails: DetailsTypes[] = [
  { name: 'client_name', type: 'text', placeholder: 'i.e. VRF1 Office', text: 'Name:' },
  { name: 'crypto_ph1', text: 'Crypto phase 1' },
  { name: 'local_as', type: 'text', text: 'BGP Local AS' },
  { name: 'crypto_ph2', text: 'Crypto phase 2' },
  { name: 'active', type: 'checkbox', text: 'Active' }
];

export const DynamicLoginForm = [
  { type: 'password', name: 'currentPassword', placeholder: 'Current password' },
  { type: 'password', name: 'newPassword', placeholder: 'New password' },
  { type: 'password', name: 'newPasswordConfirmation', placeholder: 'Repeat new password' }
];
export const DynamicRestConfForm = [
  { type: 'text', name: 'switch_username', placeholder: 'Login' },
  { type: 'password', name: 'switch_password', placeholder: 'Password' }
];
