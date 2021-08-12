import React, { useContext } from 'react';

import { DynamicVRFView } from '../db/dynamicVRFView';

import { VrfsContext } from 'context';

import { Field } from 'template';

export const useCreateVRFMainView = () => {
  const { vrf } = useContext(VrfsContext);

  const { mainVRFViewColumnOne, mainVRFViewColumnTwo, mainVRFViewColumnThree } = DynamicVRFView;

  const VRFColumnOneView = mainVRFViewColumnOne.map((column) => <Field {...column}  value={vrf[column.name]} />);
  const VRFColumnTwoView = mainVRFViewColumnTwo.map((column) => <Field {...column} value={vrf[column.name]} />);
  const VRFColumnThreeView = mainVRFViewColumnThree.map((column) => <Field {...column} value={vrf[column.name]} />);

  return { VRFColumnOneView, VRFColumnTwoView, VRFColumnThreeView };
};
