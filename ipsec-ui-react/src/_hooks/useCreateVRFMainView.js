import React, { useContext } from 'react';

import { DynamicVRFView } from '../db/dynamicVRFView';

import { useLocation } from "react-router-dom";

import { Field } from 'template';

export const useCreateVRFMainView = (vrfs) => {
  const location = useLocation()
  const VRFId = parseInt(location.pathname.split('/vrf/')[1]);
  const filteredVRFId = () => {if(vrfs.length > 0) {return vrfs.filter(element => element.id === VRFId);}};

  const { mainVRFViewColumnOne, mainVRFViewColumnTwo, mainVRFViewColumnThree } = DynamicVRFView;

  const VRFColumnOneView = mainVRFViewColumnOne.map((el) => <Field {...el} value={filteredVRFId[el.name]} />);
  const VRFColumnTwoView = mainVRFViewColumnTwo.map((el) => <Field {...el} value={filteredVRFId[el.name]} />);
  const VRFColumnThreeView = mainVRFViewColumnThree.map((el) => <Field {...el} value={filteredVRFId[el.name]} />);

  return { VRFColumnOneView, VRFColumnTwoView, VRFColumnThreeView };
};
