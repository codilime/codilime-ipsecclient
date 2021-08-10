import React, { useContext } from 'react';

import { DynamicVRFView } from '../db/dynamicVRFView';

import { VrfsContext } from 'context';

import { Field } from 'template';

export const useCreateVRFMainView = () => {
  const { vrf } = useContext(VrfsContext);

  const { mainVRFViewColumnOne, mainVRFViewColumnTwo, mainVRFViewColumnThree } = DynamicVRFView;

  const VRFColumnOneView = mainVRFViewColumnOne.map((el) => <Field {...el} value={vrf[el.name]} />);
  const VRFColumnTwoView = mainVRFViewColumnTwo.map((el) => <Field {...el} value={vrf[el.name]} />);
  const VRFColumnThreeView = mainVRFViewColumnThree.map((el) => <Field {...el} value={vrf[el.name]} />);

  return { VRFColumnOneView, VRFColumnTwoView, VRFColumnThreeView };
};
