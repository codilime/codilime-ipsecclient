import React, { useContext, useRef, useEffect, useState } from 'react';
import { Wrapper } from 'template';
import { VisualizationEndpoints } from 'template';
import { VrfsContext } from 'context';
import './styles.scss';

export const Visualization = () => {
  const emptyEndpoint = <div className="visualization__empty">Add endpoints to vizualize them</div>;
  const [dimensions, setDimensions] = useState(0);
  const {
    vrf: { data }
  } = useContext(VrfsContext);
  const wrapper = useRef(null);
  const { endpoints } = data;

  useEffect(() => {
    if (wrapper.current) {
      setDimensions(wrapper.current.offsetWidth);
    }
  }, [wrapper]);

  const context = endpoints === null || !endpoints.length ? emptyEndpoint : <VisualizationEndpoints {...{ data, dimensions }} />;

  return (
    <Wrapper title="Visualization" references={wrapper}>
      {context}
    </Wrapper>
  );
};
