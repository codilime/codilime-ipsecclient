import React from 'react';

import { DynamicVRFView } from '../db/dynamicVRFView';
import { Field } from '../components/template';

export const useCreateVRFMainView = () => {
  const { mainVRFViewColumnOne, mainVRFViewColumnTwo, mainVRFViewColumnThree } = DynamicVRFView;

  const obj = {
    "id": 1,
    "client_name": "test vrf",
    "vlan": 10,
    "crypto_ph1": [
      "a",
      "b",
      "c"
    ],
    "crypto_ph2": [
      "a",
      "b",
      "c"
    ],
    "physical_interface": "eth0",
    "active": false,
    "hardware_support": false,
    "local_as": 14,
    "lan_ip": "maska",
    "endpoints": [
      {
        "remote_ip_sec": "213.189.47.210",
        "local_ip": "213.189.47.210",
        "peer_ip": "213.189.47.210",
        "psk": "password",
        "nat": false,
        "bgp": true,
        "remote_as": -1,
        "hover": false,
        "source_interface": ""
      },
      {
        "remote_ip_sec": "213.189.47.210",
        "local_ip": "213.189.47.210",
        "peer_ip": "213.189.47.210",
        "psk": "password",
        "nat": true,
        "bgp": true,
        "remote_as": -1,
        "hover": false,
        "source_interface": ""
      },
      {
        "remote_ip_sec": "213.189.47.210",
        "local_ip": "213.189.47.210",
        "peer_ip": "213.189.47.210",
        "psk": "password",
        "nat": true,
        "bgp": false,
        "remote_as": -1,
        "hover": false,
        "source_interface": ""
      }
    ]
  };

  const VRFColumnOneView = mainVRFViewColumnOne.map((el) => <Field {...el} value={obj[el.name]} />);
  const VRFColumnTwoView = mainVRFViewColumnTwo.map((el) => <Field {...el} value={obj[el.name]} />);
  const VRFColumnThreeView = mainVRFViewColumnThree.map((el) => <Field {...el} value={obj[el.name]} />);
  return { VRFColumnOneView, VRFColumnTwoView, VRFColumnThreeView };
};
