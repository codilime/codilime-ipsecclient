import { FC, useRef, useEffect, useState } from 'react';
import { Wrapper, VisualizationEndpoints } from 'template';
import { MetricsType } from 'interface/index';
import { useAppContext, useFetchData } from 'hooks/';
import './styles.scss';

export const Visualization: FC = () => {
  const emptyEndpoint = <div className="visualization__empty">Add endpoints to vizualize them</div>;
  const {
    vrf: { data, hardware }
  } = useAppContext();

  const [metrics, setMetrics] = useState<MetricsType[]>([]);
  const { fetchEndpointStatus } = useFetchData();

  const [dimensions, setDimensions] = useState(0);
  const wrapper = useRef<HTMLDivElement>(null);
  const { endpoints } = data;

  useEffect(() => {
    if (wrapper.current) {
      setDimensions(wrapper.current.offsetWidth);
    }
  }, [wrapper]);

  const handleFetchStatus = async () => {
    if (!data.id || endpoints === null || !endpoints.length) return;
    const status = await fetchEndpointStatus(data.id);
    setMetrics(status.endpoint_statuses);
  };

  useEffect(() => {
    handleFetchStatus();
  }, [data]);

  useEffect(() => {
    const interval = setInterval(async () => handleFetchStatus(), 5000);
    return () => {
      clearInterval(interval);
    };
  }, [data]);

  const context = endpoints === null || !endpoints?.length ? emptyEndpoint : <VisualizationEndpoints {...{ data, dimensions, metrics, hardware }} />;

  return (
    <Wrapper {...{className:'visualization__wrapper'}} title="Visualization" references={wrapper}>
      {context}
    </Wrapper>
  );
};
