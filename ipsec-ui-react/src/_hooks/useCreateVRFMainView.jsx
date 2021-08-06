import React from 'react';

import { DynamicVRFView } from '../db/DynamicVRFView';
import { Field } from '../components/template';

export const useCreateVRFMainView = () => {
  const { mainVRFViewColumnOne, mainVRFViewColumnTwo, mainVRFViewColumnThree } = DynamicVRFView;

  const VRFColumnOneView = mainVRFViewColumnOne.map((el, index) => {
    switch (el.type) {
      case 'text': {
        return <Field {...el} />;
      }
      case 'checkbox': {
        return <Field {...el} />;
      }
      default:
        return;
    }
  });
  const VRFColumnTwoView = mainVRFViewColumnTwo.map((el) => {
    switch (el.type) {
      case 'number': {
        return <Field {...el} />;
      }
      default:
        return;
    }
  })
  const VRFColumnThreeView = mainVRFViewColumnThree.map((el) => {
    switch (el.type) {
      case 'array': {
        return <Field {...el} />;
      }
      default:
        return;
    }
  })
  return { VRFColumnOneView, VRFColumnTwoView, VRFColumnThreeView };
};
