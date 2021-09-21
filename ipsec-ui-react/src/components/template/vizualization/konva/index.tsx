import { FC, useRef, useEffect, useState } from 'react';
import { Wrapper, VisualizationEndpoints, Cube } from 'template';
import { useAppContext, useFetchData } from 'hooks/';
import './styles.scss';

export const Visualization: FC = () => {
  const emptyEndpoint = <div className="visualization__empty">Add endpoints to vizualize them</div>;
  const {
    vrf: { data }
  } = useAppContext();

  const [metrics, setMetrics] = useState<{ endpoint_statuses: any[] }>();
  const { fetchEndpointStatus } = useFetchData();

  const [dimensions, setDimensions] = useState(0);
  const wrapper = useRef<HTMLDivElement>(null);
  const { endpoints } = data;

  useEffect(() => {
    if (wrapper.current) {
      setDimensions(wrapper.current.offsetWidth);
    }
  }, [wrapper]);
  useEffect(() => {}, []);
  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     if (data.id) {
  //       const status = await fetchEndpointStatus(data.id);
  //       setMetrics(status);
  //     }
  //   }, 5000);
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [endpoints]);

  const context = endpoints === null || !endpoints?.length ? emptyEndpoint : <VisualizationEndpoints {...{ data, dimensions, metrics }} />;

  return (
    <Wrapper title="Visualization" references={wrapper}>
      {context}
    </Wrapper>
  );
};
