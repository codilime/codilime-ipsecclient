import React, { useContext, useRef, useEffect, useState } from 'react';
import { Wrapper } from 'template';
import { VisualizationEndpoints } from 'template';
import { VrfsContext } from 'context';
import './styles.scss';

export const Visualization = () => {
  const emptyEndpoint = <div className="visualization__empty">Add endpoints to vizualize them</div>;
  const {
    vrf: { data }
  } = useContext(VrfsContext);
  const { endpoints } = data;

  if (endpoints === null || !endpoints.length) {
    return <Wrapper title="Visualization">{emptyEndpoint}</Wrapper>;
  }

  const [dimensions, setDimensions] = useState(0);
  const wrapper = useRef(null);

  useEffect(() => {
    if (wrapper.current) {
      setDimensions(wrapper.current.offsetWidth);
    }
  }, [wrapper]);

  return (
    <Wrapper title="Visualization" references={wrapper}>
      <VisualizationEndpoints {...{ data, dimensions,status:'ACTIVE' }} />
    </Wrapper>
  );
};
