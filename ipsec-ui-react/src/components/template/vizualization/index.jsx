import React from 'react';
import { Wrapper } from 'template';

export const Visualization = () => {
  const emptyEndpoint = <div className="visualization__empty">Add endpoints to vizualize them</div>;

  return <Wrapper title="Visualization">{emptyEndpoint}</Wrapper>;
};
