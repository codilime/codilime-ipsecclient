import React from 'react';

import { DynamicVRFView } from '../db/DynamicVRFView';
import { Field } from '../components/template';

export const useCreateVRFMainView = () => {
  const { mainVRFViewColumnOne, mainVRFViewColumnTwo, mainVRFViewColumnThree } = DynamicVRFView;

  // const obj = {
  //   "id": 1,
  //   "client_name": "123",
  //   "vlan": 1,
  //   "crypto_ph1": [
  //     "",
  //     "",
  //     ""
  //   ],
  //   "crypto_ph2": [
  //     "",
  //     "",
  //     ""
  //   ],
  //   "physical_interface": "",
  //   "active": false,
  //   "hardware_support": false,
  //   "local_as": 1,
  //   "lan_ip": "asdasd",
  //   "endpoints": null
  // };

  const VRFColumnOneView = mainVRFViewColumnOne.map((el, index) => {
    switch (el.name) {
      case 'client_name': {
        return <Field {...el} />;
      }
      case 'lan_ip': {
        return <Field {...el} />;
      }
      case 'physical_interface': {
        return <Field {...el} />;
      }
      case 'active': {
        return <Field {...el} />;
      }
      case 'hardware_support': {
        return <Field {...el} />;
      }
      default:
        return;
    }
  });
  const VRFColumnTwoView = mainVRFViewColumnTwo.map((el) => {
    switch (el.name) {
      case 'local_as': {
        return <Field {...el} />;
      }
      case 'vlan': {
        return <Field {...el} />;
      }
      default:
        return;
    }
  })
  const VRFColumnThreeView = mainVRFViewColumnThree.map((el) => {
    switch (el.name) {
      case 'crypto_ph1': {
        return <Field {...el} />;
      }
      case 'crypto_ph2': {
        return <Field {...el} />;
      }
      default:
        return;
    }
  })
  return { VRFColumnOneView, VRFColumnTwoView, VRFColumnThreeView };
};
