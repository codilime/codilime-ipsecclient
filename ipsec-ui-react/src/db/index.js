export const tableHeaderSchema = [
  { item: 'Remote IP', className: 'header__name' },
  { item: 'Local IP', className: 'header__name' },
  { item: 'Peer IP', className: 'header__name' },
  { item: 'PSK', className: 'header__name' },
  { item: 'NAT', className: 'header__name' },
  { item: 'BGP', className: 'header__name' },
  { item: 'ACTION', className: 'header__name' }
];

export const emptyEndpointSchema = {
  remote_ip_sec: '',
  local_ip: '',
  peer_ip: '',
  psk: '',
  nat: false,
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

export const endpoint = [
  {
    remote_ip_sec: '192.158.1.38',
    local_ip: '192.158.1.38',
    peer_ip: '192.158.1.38',
    psk: 'Tajne hasło',
    nat: true,
    bgp: true
  },
  {
    remote_ip_sec: '192.158.1.38',
    local_ip: '192.158.1.38',
    peer_ip: '192.158.1.38',
    psk: 'Tajne hasło',
    nat: true,
    bgp: true
  },
  {
    remote_ip_sec: '192.158.1.38',
    local_ip: '192.158.1.38',
    peer_ip: '192.158.1.38',
    psk: 'Tajne hasło',
    nat: true,
    bgp: true
  }
];

export const defaultVrf = {
  id: '',
  client_name: '',
  vlan: 0,
  crypto_ph1: [],
  crypto_ph2: [],
  physical_interface: '',
  active: false,
  hardware_support: false,
  local_as: 0,
  lan_ip: '',
  endpoints: [
    {
      remote_ip_sec: '',
      local_ip: '',
      peer_ip: '',
      psk: '',
      nat: false,
      bgp: false,
      remote_as: -1,
      hover: false,
      source_interface: ''
    }
  ]
};

export const detailForm = [
  {
    type: 'text',
    name: 'client_name',
    placeholder: 'i. e. VRF1 Work Office'
  },
  {
    type: 'text',
    name: 'lan_ip',
    placeholder: 'i. e. secret_agent'
  },
  {
    type: 'text',
    name: 'physical_interface',
    placeholder: 'i. e. eth0'
  },
  {
    type: 'checkbox',
    name: 'active'
  },
  {
    type: 'checkbox',
    name: 'hardware_support'
  },
  {
    type: 'number',
    name: 'local_as'
  },
  {
    type: 'number',
    name: 'vlan'
  }
];
