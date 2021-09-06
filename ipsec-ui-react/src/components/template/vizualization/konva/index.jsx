import React, { useContext, useRef, useEffect, useState } from 'react';
import { Wrapper, VisualizationEndpoints, Cube } from 'template';
import { VrfsContext } from 'context';
import './styles.scss';

export const Visualization = () => {
  const emptyEndpoint = <div className="visualization__empty">Add endpoints to vizualize them</div>;
  const [dimensions, setDimensions] = useState(0);
  const {
    vrf: { data, loading }
  } = useContext(VrfsContext);
  const wrapper = useRef(null);
  const { endpoints } = data;

  useEffect(() => {
    if (wrapper.current) {
      setDimensions(wrapper.current.offsetWidth);
    }
  }, [wrapper]);

  const context = endpoints === null || !endpoints.length ? emptyEndpoint : <VisualizationEndpoints {...{ data, dimensions }} />;
  const status = true;
  if (status) {
    return (
      <Wrapper title="Visualization">
        <Cube />
      </Wrapper>
    );
  }

  return (
    <Wrapper title="Visualization" references={wrapper}>
      {context}
    </Wrapper>
  );
};
