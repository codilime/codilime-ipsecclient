import { FC, useRef, useEffect, useState } from 'react';
import { Wrapper, VisualizationEndpoints, Cube } from 'template';
import { useAppContext } from 'hooks/';
import './styles.scss';

export const Visualization: FC = () => {
  const emptyEndpoint = <div className="visualization__empty">Add endpoints to vizualize them</div>;
  const {
    vrf: { data }
  } = useAppContext();

  const [dimensions, setDimensions] = useState(0);
  const wrapper = useRef<HTMLDivElement>(null);
  const { endpoints } = data;

  useEffect(() => {
    if (wrapper.current) {
      setDimensions(wrapper.current.offsetWidth);
    }
  }, [wrapper]);
  const context = endpoints === null || !endpoints?.length ? emptyEndpoint : <VisualizationEndpoints {...{ data, dimensions }} />;
  const status = false;
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
