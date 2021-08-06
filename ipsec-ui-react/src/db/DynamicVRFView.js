export const DynamicVRFView = {
  mainVRFViewColumnOne: [
    { type: 'text', name: 'client_name', placeholder: 'i.e. VRF1 Office', text: 'Name:'},
    { type: 'text', name: 'lan_ip', placeholder: 'i. e. secret_agent', text: 'Lan IP / Mask:' },
    { type: 'text', name: 'physical_interface', placeholder: 'i. e. eth0', text:'Physical interface:' },
    { type: 'checkbox', name: 'active', text:'Active' },
    { type: 'checkbox', name: 'hardware_support', text: 'Hardware support' }
  ],
  mainVRFViewColumnTwo: [
    { type: 'number', name: 'local_as', text: 'BGP Local AS' },
    { type: 'number', name: 'vlan', text: 'VLAN' }
  ],
  mainVRFViewColumnThree: [
    { type: 'array', name: 'crypto_ph1', text: 'Crypto phase 1' },
    { type: 'array', name: 'crypto_ph2', text: 'Crypto phase 2' }
  ]
};
